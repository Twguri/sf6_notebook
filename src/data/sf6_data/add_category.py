import csv
from pathlib import Path

# ===== 配置区 =====
FOLDER = Path(".")     # 改成你的 CSV 文件夹路径
RECURSIVE = False      # True = 递归子文件夹
ID_COL = "id"
NEW_COL = "category"
# ==================

def process_one(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return False, "empty file"

    header = rows[0]
    data_rows = rows[1:]

    if ID_COL not in header:
        return False, "no id column"

    if NEW_COL in header:
        return False, "already has catagory"

    id_idx = header.index(ID_COL)

    # --- 新表头 ---
    new_header = []
    for i, col in enumerate(header):
        new_header.append(col)
        if i == id_idx:
            new_header.append(NEW_COL)

    new_rows = [new_header]

    # --- 新数据 ---
    for row in data_rows:
        row = row + [""] * (len(header) - len(row))
        new_row = []
        for i, val in enumerate(row):
            new_row.append(val)
            if i == id_idx:
                new_row.append("")  # catagory 为空
        new_rows.append(new_row)

    # --- 覆盖写回 ---
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(new_rows)

    return True, "catagory added"

def main():
    files = sorted(FOLDER.rglob("*.csv") if RECURSIVE else FOLDER.glob("*.csv"))
    if not files:
        print(f"❌ No CSV files found in {FOLDER.resolve()}")
        return

    changed = 0
    for f in files:
        try:
            did, msg = process_one(f)
            print(("✅" if did else "ℹ️") + f" {f.name}: {msg}")
            if did:
                changed += 1
        except Exception as e:
            print(f"❌ {f.name}: error {e}")

    print(f"\nDone. Updated {changed}/{len(files)} CSV files.")

if __name__ == "__main__":
    main()
