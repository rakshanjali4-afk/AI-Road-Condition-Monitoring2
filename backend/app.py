
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
    results = model.predict(source=image_path, conf=0.25, save=False)
    

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


    # Road condition rule
    detected_classes = [
        detection["name"]
        for detection in detections
    ]


    if "UnsurfacedRoad" in detected_classes:

        condition = "BAD"

    elif "RoadDamages" in detected_classes:

        condition = "BAD"

    elif "SpeedBump" in detected_classes:

        condition = "MODERATE"

    else:

        condition = "GOOD"


    # Send JSON response
    return jsonify({

        "condition": condition,

        "image_url":
            f"/static/uploads/{output_name}",

        "detections": detections

    })


if __name__ == "__main__":
    app.run(
        debug=True
    )