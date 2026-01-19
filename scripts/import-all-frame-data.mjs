import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const UPSTREAM_DIR = path.join(ROOT, "vendor", "sf6-move-data", "moves");
const OUT_DIR = path.join(ROOT, "src", "data", "frameData");

// 你的单角色导入脚本文件名（根据你现在项目里实际文件名改一下）
const ONE_SCRIPT = path.join(ROOT, "scripts", "import-sf6-move-data.mjs");

function listTomlIds() {
  if (!fs.existsSync(UPSTREAM_DIR)) {
    throw new Error(`Upstream dir not found: ${UPSTREAM_DIR}`);
  }
  const files = fs.readdirSync(UPSTREAM_DIR).filter((f) => f.endsWith(".toml"));
  return files
    .map((f) => f.replace(/\.toml$/i, ""))
    .sort((a, b) => a.localeCompare(b));
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function runOne(id) {
  const r = spawnSync(process.execPath, [ONE_SCRIPT, id], {
    stdio: "inherit",
  });
  if (r.status !== 0) throw new Error(`Import failed for ${id}`);
}

function main() {
  ensureOutDir();

  const ids = listTomlIds();
  console.log(`🧾 Found ${ids.length} TOML files in moves/`);

  // 可选：只导入一部分（如果你以后想分批）
  const only = process.argv.slice(2).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const targets = only.length ? ids.filter((id) => only.includes(id)) : ids;

  console.log(`🚀 Importing ${targets.length} character(s)...`);

  const start = Date.now();
  for (const id of targets) {
    console.log(`\n=== ${id} ===`);
    runOne(id);
  }

  const ms = Date.now() - start;
  console.log(`\n✅ Done. Imported ${targets.length} character(s) in ${(ms / 1000).toFixed(1)}s.`);
  console.log(`📁 Output: ${OUT_DIR}`);
}

main();
