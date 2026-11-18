from pathlib import Path
from collections import Counter

root = Path(r"C:/Users/bhaskar choudhary/Downloads/project")

names = [
    "HMV",
    "LMV",
    "Pedestrian",
    "RoadDamages",
    "SpeedBump",
    "UnsurfacedRoad"
]

for split in ["train", "valid", "test"]:
    label_dir = root / split / "labels"

    if not label_dir.exists():
        print(f"\n{split.upper()}: Labels folder not found")
        continue

    files = list(label_dir.glob("*.txt"))
    counts = Counter()

    for file in files:
        for line in file.read_text().splitlines():
            if line.strip():
                class_id = int(line.split()[0])
                counts[class_id] += 1

    print(f"\n{split.upper()} — Label files: {len(files)}")

    for i, name in enumerate(names):
        print(f"{name}: {counts[i]}")