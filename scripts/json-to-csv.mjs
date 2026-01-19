import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const IN_DIR = path.join(ROOT, "src", "data", "frameData");
const OUT_DIR = path.join(ROOT, "csv");

const COLUMNS = [
  "id",
  "category",
  "nameEN",
  "nameCN",
  "input",
  "inputDisplay",
  "hitType",
  "startup",
  "active",
  "recovery",
  "onBlock",
  "onHit",
  "damage",
  "superArt",
  "driveOnHit",
  "driveOnBlock",
  "driveOnPunishCounter",
  "cancel",
];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function csvEscape(v) {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCSV(rows) {
  const lines = [];
  lines.push(COLUMNS.join(","));
  for (const r of rows) {
    lines.push(COLUMNS.map((k) => csvEscape(r[k])).join(","));
  }
  return lines.join("\n") + "\n";
}

function exportOne(file) {
  const jsonPath = path.join(IN_DIR, file);
  const obj = readJSON(jsonPath);

  const id = obj.characterId ?? file.replace(/\.json$/i, "");
  const displayNameCN = obj.displayNameCN ?? "";
  const displayNameEN = obj.displayNameEN ?? "";

  const rows = (obj.moves ?? []).map((m) => {
    const row = {};
    for (const k of COLUMNS) row[k] = m?.[k] ?? "";
    return row;
  });

  const metaLines = [
    "#SF6APP_META",
    `#characterId=${id}`,
    `#displayNameCN=${displayNameCN}`,
    `#displayNameEN=${displayNameEN}`,
    "#(You can edit CSV freely. Lines starting with # are ignored on import.)",
    "",
  ].join("\n");

  const outPath = path.join(OUT_DIR, `${id}.csv`);
  fs.writeFileSync(outPath, metaLines + toCSV(rows), "utf-8");
  console.log(`✅ Exported: ${id} -> ${outPath}`);
}

function main() {
  ensureDir(OUT_DIR);

  const arg = (process.argv[2] || "").trim().toLowerCase();
  if (arg) {
    exportOne(`${arg}.json`);
    return;
  }

  const files = fs.readdirSync(IN_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) exportOne(f);

  console.log(`\nDone. CSV output folder: ${OUT_DIR}`);
}

main();
