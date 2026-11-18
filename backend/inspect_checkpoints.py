from ultralytics import YOLO

models = [
    "best_new.pt",
    r"C:\Users\bhaskar choudhary\Downloads\project\runs\detect\train\weights\best.pt",
    r"C:\Users\bhaskar choudhary\Downloads\project\runs\detect\train-2\weights\best.pt"
]

for path in models:
    print("\n==============================")
    print("MODEL:", path)
    print("==============================")

    model = YOLO(path)
    ckpt = model.ckpt or {}

    print("Architecture:", ckpt.get("model").yaml.get("yaml_file")
          if ckpt.get("model") is not None else "Unavailable")
    print("Completed epoch:", ckpt.get("epoch"))

    args = ckpt.get("train_args", {})

    for key in ["data", "epochs", "imgsz", "batch", "device", "save_dir"]:
        print(f"{key}: {args.get(key, 'Unavailable')}")