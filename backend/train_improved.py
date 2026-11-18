
from ultralytics import YOLO

# Load your existing trained model
model = YOLO("best_new.pt")

# Fine-tune the existing model
results = model.train(
    data=r"C:\Users\bhaskar choudhary\Downloads\images\balanced_data.yaml",

    epochs=20,
    imgsz=256,
    batch=4,

    device="cpu",
    workers=0,

    optimizer="AdamW",
    lr0=0.0005,
    lrf=0.01,
    weight_decay=0.0005,

    patience=5,
    cos_lr=True,
    warmup_epochs=2,

    mosaic=0.5,
    close_mosaic=5,
    fliplr=0.5,
    translate=0.1,
    scale=0.3,

    plots=True,
    save=True,

    project="runs/precision_improvement",
    name="yolo11n_improved",
    exist_ok=False
)

print("Training completed!")
print("Best model saved at:")
print("runs/precision_improvement/yolo11n_improved/weights/best.pt")
