from pathlib import Path

# ===== 配置区 =====
FOLDER = Path(".")   # 改成你的 CSV 文件夹路径
RECURSIVE = False    # True = 递归子文件夹
TARGET_HEADER = (
    "id,category,nameEN,nameCN,input,startup,active,recovery,"
    " onHit,onBlock,cancel,damage,comboScaling,"
    "driveOnHit,driveOnBlock,driveOnPunishConter,"
    "superArt,Properties,notesEN,notesCN\n"
)
# ==================

def process_one(path: Path):
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines(True)
    if not lines:
        return False, "empty file"

    if lines[0].strip() == TARGET_HEADER.strip():
        return False, "already correct"

    lines[0] = TARGET_HEADER
    path.write_text("".join(lines), encoding="utf-8", newline="")
    return True, "header replaced"

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

    print(f"\nDone. Replaced header in {changed}/{len(files)} CSV files.")

if __name__ == "__main__":
    main()
