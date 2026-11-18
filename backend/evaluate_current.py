from ultralytics import YOLO

model = YOLO("best_new.pt")

results = model.val(
    data=r"C:\Users\bhaskar choudhary\Downloads\images\balanced_data.yaml",
    split="test",
    imgsz=256,
    device="cpu",
    plots=True,
    project="runs/comparison",
    name="yolo11n_current_test"
)

print("\n===== YOLO11n TEST RESULTS =====")
print("Precision:", round(results.box.mp * 100, 2), "%")
print("Recall:", round(results.box.mr * 100, 2), "%")
print("mAP50:", round(results.box.map50 * 100, 2), "%")
print("mAP50-95:", round(results.box.map * 100, 2), "%")
print("Inference time:", results.speed["inference"], "ms/image")