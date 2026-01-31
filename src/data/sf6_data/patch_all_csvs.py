# patch_all_csvs.py
import csv
import re
from pathlib import Path

# ====== 配置区 ======
FOLDER = Path(".")            # 改成你的 csv 文件夹路径，例如 Path(r"./data/csv")
MOVE_NAME_COL = "Move Name"   # 你澄清后的列名
# ====================

def make_id(name: str) -> str:
    if not name:
        return ""
    s = str(name).strip().lower()
    s = re.sub(r"[’'()]", "", s)          # 去掉括号/撇号
    s = re.sub(r"\s+", "_", s)            # 空白 -> _
    s = re.sub(r"[^a-z0-9_]", "", s)      # 去掉其它符号
    s = re.sub(r"_+", "_", s).strip("_")  # 合并多下划线
    return s

def patch_one_csv(file_path: Path) -> tuple[bool, str]:
    # 返回 (是否修改, 信息)
    with file_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return (False, "empty file")

    header = rows[0]
    data_rows = rows[1:]

    if MOVE_NAME_COL not in header:
        return (False, f"missing column '{MOVE_NAME_COL}'")

    existing = set(h.strip() for h in header)
    move_idx = header.index(MOVE_NAME_COL)

    need_id = "id" not in existing
    need_cn = "move_name_CN" not in existing
    need_input = "input" not in existing
    need_notes_cn = "notes_CN" not in existing

    if not (need_id or need_cn or need_input or need_notes_cn):
        return (False, "already patched")

    # --- 新表头 ---
    new_header = []
    for i, col in enumerate(header):
        if i == move_idx and need_id:
            new_header.append("id")
        new_header.append(col)

        if i == move_idx:
            if need_cn:
                new_header.append("move_name_CN")
            if need_input:
                new_header.append("input")

    if need_notes_cn:
        new_header.append("notes_CN")

    # --- 新数据 ---
    new_rows = [new_header]
    for row in data_rows:
        # 补齐行长度
        row = row + [""] * (len(header) - len(row))

        new_row = []
        for i, val in enumerate(row):
            if i == move_idx and need_id:
                new_row.append(make_id(val))
            new_row.append(val)

            if i == move_idx:
                if need_cn:
                    new_row.append("")
                if need_input:
                    new_row.append("")

        if need_notes_cn:
            new_row.append("")

        new_rows.append(new_row)

    # 覆盖写回（保持文件名不变）
    with file_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(new_rows)

    return (True, "patched")

def main():
    csv_files = sorted(FOLDER.glob("*.csv"))
    if not csv_files:
        print(f"❌ No CSV files found in: {FOLDER.resolve()}")
        return

    changed = 0
    for p in csv_files:
        did, msg = patch_one_csv(p)
        status = "✅" if did else "ℹ️"
        print(f"{status} {p.name}: {msg}")
        if did:
            changed += 1

    print(f"\nDone. Patched {changed}/{len(csv_files)} CSV files in {FOLDER.resolve()}")

if __name__ == "__main__":
    main()
