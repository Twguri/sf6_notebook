import csv
from pathlib import Path

ROOT_DIR = Path(".")  # 从当前目录递归。你也可以改成 Path("src/data")

# 想跳过的目录（递归时遇到这些目录就不进）
SKIP_DIRS = {".git", "node_modules", "dist", "build", "_cleaned"}

# 是否生成备份（你说要覆盖原文件，我默认 False；你想保险就改 True）
MAKE_BAK = False


def clean_name_en(text: str) -> str:
    """
    删除所有独立 token 的 L/M/H（以空格分隔的单词），并规范空格。
    例：
      "Standing Light Punch L" -> "Standing Light Punch"
      "L Spiral Arrow L"       -> "Spiral Arrow"
      "Swing Combination H H"  -> "Swing Combination"
      "Lift Combination M H"   -> "Lift Combination"
    """
    if not text:
        return text
    tokens = text.split()  # 按任意空白分割
    tokens = [t for t in tokens if t not in {"L", "M", "H"}]
    return " ".join(tokens)


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    return any(d in parts for d in SKIP_DIRS)


def process_csv(csv_path: Path) -> tuple[bool, str]:
    # 读
    try:
        with csv_path.open("r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames or []
            if "nameEN" not in fieldnames:
                return False, "skip(no nameEN)"
            rows = list(reader)
    except Exception as e:
        return False, f"error(read): {e}"

    # 改
    changed_rows = 0
    for row in rows:
        old = row.get("nameEN", "")
        new = clean_name_en(old)
        if new != old:
            row["nameEN"] = new
            changed_rows += 1

    if changed_rows == 0:
        return False, "skip(no change)"

    # 写回（原地覆盖，先写临时文件再替换，避免写一半崩掉）
    tmp_path = csv_path.with_suffix(csv_path.suffix + ".tmp")
    try:
        if MAKE_BAK:
            bak_path = csv_path.with_suffix(csv_path.suffix + ".bak")
            if not bak_path.exists():
                csv_path.replace(bak_path)
                # 把 bak 再复制回原名，保证后续写回目标路径存在
                bak_path.replace(csv_path)

        with tmp_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        tmp_path.replace(csv_path)
        return True, f"updated({changed_rows} rows)"
    except Exception as e:
        # 尝试清理 tmp
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except:
            pass
        return False, f"error(write): {e}"


def main():
    root = ROOT_DIR.resolve()
    if not root.exists():
        print(f"❌ ROOT_DIR 不存在: {root}")
        return

    total = 0
    updated = 0
    skipped = 0
    errored = 0

    for p in root.rglob("*.csv"):
        if should_skip(p):
            continue

        total += 1
        ok, msg = process_csv(p)
        if ok:
            updated += 1
            print(f"✅ {p} | {msg}")
        else:
            if msg.startswith("error"):
                errored += 1
                print(f"❌ {p} | {msg}")
            else:
                skipped += 1
                # 你不想刷屏可以注释下一行
                # print(f"•  {p} | {msg}")

    print(f"\n完成：扫描 {total} 个 CSV | 更新 {updated} | 跳过 {skipped} | 报错 {errored}")


if __name__ == "__main__":
    main()
