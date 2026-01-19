import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSV_DIR = path.join(ROOT, "csv");
const OUT_DIR = path.join(ROOT, "src", "data", "frameData");

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

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

// Minimal CSV parser (handles quotes)
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const meta = {};
  const dataLines = [];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("#")) {
      // meta line like: #key=value
      const m = line.match(/^#([A-Za-z0-9_]+)=(.*)$/);
      if (m) meta[m[1]] = m[2];
      continue;
    }
    dataLines.push(line);
  }
  if (dataLines.length === 0) return { meta, header: [], rows: [] };

  const header = splitCSVLine(dataLines[0]);
  const rows = [];
  for (let i = 1; i < dataLines.length; i++) {
    const cols = splitCSVLine(dataLines[i]);
    if (cols.length === 1 && cols[0].trim() === "") continue;
    const row = {};
    for (let j = 0; j < header.length; j++) row[header[j]] = cols[j] ?? "";
    rows.push(row);
  }
  return { meta, header, rows };
}

function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQ = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function importOne(id) {
  const csvPath = path.join(CSV_DIR, `${id}.csv`);
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const { meta, header, rows } = parseCSV(fs.readFileSync(csvPath, "utf-8"));
  if (header.length === 0) throw new Error(`CSV has no header: ${csvPath}`);

  // Existing JSON (optional) for fallback names
  const outPath = path.join(OUT_DIR, `${id}.json`);
  const old = safeReadJSON(outPath);

  const characterId = meta.characterId || old?.characterId || id;
  const displayNameCN = meta.displayNameCN ?? old?.displayNameCN ?? "";
  const displayNameEN = meta.displayNameEN ?? old?.displayNameEN ?? "";

  // Build moves strictly from CSV
  const moves = rows.map((r) => {
    const m = {};
    for (const k of COLUMNS) m[k] = (r[k] ?? "").trim();
    return m;
  });

  // nameCNMap from CSV: non-empty only
  const nameCNMap = {};
  for (const m of moves) {
    if (m.id && m.nameCN) nameCNMap[m.id] = m.nameCN;
  }

  const output = {
    characterId,
    displayNameCN,
    displayNameEN,
    lastUpdated: todayISO(),
    nameCNMap,
    moves,
  };

  ensureDir(OUT_DIR);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`✅ Imported: ${id} <- ${csvPath}`);
}

function main() {
  ensureDir(OUT_DIR);

  const arg = (process.argv[2] || "").trim().toLowerCase();
  if (arg) {
    importOne(arg);
    return;
  }

  if (!fs.existsSync(CSV_DIR)) {
    console.error(`❌ CSV dir not found: ${CSV_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith(".csv"));
  for (const f of files) {
    const id = f.replace(/\.csv$/i, "");
    importOne(id);
  }

  console.log(`\nDone. JSON output folder: ${OUT_DIR}`);
}

main();
