import pandas as pd
from pathlib import Path

root = Path(r"C:/Users/bhaskar choudhary/Downloads/project/runs/detect")

files = [
    root / "train" / "results.csv",
    root / "train-2" / "results.csv"
]

for file in files:
    print("\n================================")
    print("TRAINING RUN:", file.parent.parent.name)
    print("================================")

    if file.exists():
        df = pd.read_csv(file)

        print("Completed epochs:", len(df))
        print("\nAvailable metrics:")
        print(df.columns.tolist())

        print("\nLast 3 epochs:")
        print(df.tail(3).to_string(index=False))
    else:
        print("Results file not found:", file)