import csv
import re

FILE = "aki.csv"              # 直接覆盖这个文件
MOVE_NAME_COL = "Move Name"   # 如果你实际列名不同，就改这里

def make_id(name: str) -> str:
    if not name:
        return ""
    s = name.strip().lower()
    s = re.sub(r"[’'()]", "", s)          # 去掉括号/撇号
    s = re.sub(r"\s+", "_", s)            # 空格 -> _
    s = re.sub(r"[^a-z0-9_]", "", s)      # 去掉其它符号
    s = re.sub(r"_+", "_", s).strip("_")  # 合并多下划线
    return s

with open(FILE, "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    rows = list(reader)

if not rows:
    raise ValueError("❌ CSV 为空")

header = rows[0]
data_rows = rows[1:]

if MOVE_NAME_COL not in header:
    raise ValueError(f"❌ 找不到列名: '{MOVE_NAME_COL}'，请把 MOVE_NAME_COL 改成你文件里的实际列名")

move_idx = header.index(MOVE_NAME_COL)

# 如果已经有 id / move_name_CN / input / notes_CN，就不要重复加（避免脚本重复运行把列加爆）
existing = set(h.strip() for h in header)

# --- 构造新表头 ---
new_header = []
for i, col in enumerate(header):
    if i == move_idx and "id" not in existing:
        new_header.append("id")
    new_header.append(col)

    if i == move_idx:
        if "move_name_CN" not in existing:
            new_header.append("move_name_CN")
        if "input" not in existing:
            new_header.append("input")

if "notes_CN" not in existing:
    new_header.append("notes_CN")

new_rows = [new_header]

# --- 构造数据行 ---
for row in data_rows:
    row = row + [""] * (len(header) - len(row))  # 补齐

    new_row = []
    for i, val in enumerate(row):
        if i == move_idx and "id" not in existing:
            new_row.append(make_id(val))
        new_row.append(val)

        if i == move_idx:
            if "move_name_CN" not in existing:
                new_row.append("")
            if "input" not in existing:
                new_row.append("")

    if "notes_CN" not in existing:
        new_row.append("")

    new_rows.append(new_row)

# --- 覆盖写回原文件（文件名不变） ---
with open(FILE, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(new_rows)

print("✅ 完成：已覆盖原文件，并按要求插入列（文件名不变）")
