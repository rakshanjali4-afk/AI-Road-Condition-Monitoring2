
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2

app = Flask(__name__)

# Allow Lovable frontend to communicate with Flask
CORS(app)

# Load trained YOLO model
model = YOLO("best_new.pt")

# Upload folder
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def determine_road_condition(detections):
    """
    Evaluates road condition and score based on YOLO detection results.

    Rules:
    - RoadDamages or UnsurfacedRoad -> Condition: BAD (poor/unsafe).
      Score is calculated with deductions.
    - SpeedBump (without damage) -> Condition: MODERATE (caution).
      Score is calculated with minor deduction.
    - Only traffic objects (LMV, HMV, Pedestrian) or no detections ->
      Condition: ANALYSIS INCONCLUSIVE.
      Traffic detections must not count as evidence that the road is safe.
      Score is None (unavailable: —/100).
    """
    safe_detections = detections if isinstance(detections, list) else []

    damage_count = sum(1 for d in safe_detections if isinstance(d, dict) and d.get("name") == "RoadDamages")
    unsurfaced_count = sum(1 for d in safe_detections if isinstance(d, dict) and d.get("name") == "UnsurfacedRoad")
    speed_bump_count = sum(1 for d in safe_detections if isinstance(d, dict) and d.get("name") == "SpeedBump")

    if damage_count > 0 or unsurfaced_count > 0:
        condition = "BAD"
        score = max(0, min(100, 100 - (damage_count * 20) - (unsurfaced_count * 20) - (speed_bump_count * 5)))
    elif speed_bump_count > 0:
        condition = "MODERATE"
        score = max(0, min(100, 100 - (speed_bump_count * 5)))
    else:
        condition = "ANALYSIS INCONCLUSIVE"
        score = None

    return condition, score


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    # Check whether image was uploaded
    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    image = request.files["image"]

    # Check filename
    if image.filename == "":
        return jsonify({
            "error": "No image selected"
        }), 400

    # Save uploaded image
    image_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        image.filename
    )

    image.save(image_path)

    # Run YOLO detection
    results = model.predict(source=image_path, conf=0.40,iou=0.45, save=False)
    

    result = results[0]

    # Create annotated image
    annotated_image = result.plot()

    output_name = "result_" + image.filename

    output_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        output_name
    )

    cv2.imwrite(
        output_path,
        annotated_image
    )

    # Store detections
    detections = []

    for box in result.boxes:

        class_id = int(box.cls[0])

        confidence = float(
            box.conf[0]
        )

        class_name = model.names[class_id]

        detections.append({
            "name": class_name,
            "confidence": round(
                confidence * 100,
                2
            )
        })

    # Evaluate road condition and score
    condition, score = determine_road_condition(detections)

    # Send JSON response
    return jsonify({
        "condition": condition,
        "score": score,
        "image_url": f"/static/uploads/{output_name}",
        "detections": detections
    })


if __name__ == "__main__":
    app.run(
        debug=True
    )
