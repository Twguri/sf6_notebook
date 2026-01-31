import fs from "node:fs";
import path from "node:path";






// ---- Paths (FINAL, EXPLICIT) ----
const ROOT = process.cwd();

// ✅ 输入：CSV 直接放在 src/data/sf6_data
const CSV_DIR = path.join(ROOT, "src", "data", "sf6_data");

// ✅ 输出：JSON 放在 src/data/frameData
const OUT_DIR = path.join(ROOT, "src", "data", "frameData");



// ---- Header canonicalization ----
// Canonical (what you want to store). We DO NOT force lower-case because you want "Properties".
// We map many possible CSV header spellings (human-friendly or typo) to these canonical keys.
const HEADER_ALIASES = new Map(
  Object.entries({
    // common typos / spacing
    catagory: "category",
    "catagory ": "category",
    " category": "category",

    // names
    "move name": "nameEN",
    movename: "nameEN",
    name_en: "nameEN",
    "name en": "nameEN",
    "move_name": "nameEN",
    move_name: "nameEN",

    "move name cn": "nameCN",
    move_name_cn: "nameCN",
    "move_name_cn": "nameCN",
    name_cn: "nameCN",
    "name cn": "nameCN",

    // frame columns
    "frame start-up": "startup",
    "frame start up": "startup",
    "start-up": "startup",
    startup: "startup",
    active: "active",
    recovery: "recovery",

    // advantage
    "recovery hit": "onHit",
    onhit: "onHit",
    "on hit": "onHit",
    "on-hit": "onHit",

    block: "onBlock",
    onblock: "onBlock",
    "on block": "onBlock",
    "on-block": "onBlock",

    // drive & sa
    "drive gauge increase hit": "driveOnHit",
    "drive gauge decrease block": "driveOnBlock",
    "punish counter": "driveOnPunishCounter",
    "driveonpunishconter": "driveOnPunishCounter", // typo
    "driveonpunishcounter": "driveOnPunishCounter",
    "driveonpunish counter": "driveOnPunishCounter",
    "super art gauge increase": "superArt",

    // misc
    "combo scaling": "comboScaling",
    properties: "Properties",
    "miscellaneous": "Miscellaneous",
    notes_cn: "notesCN",
    notes_en: "notesEN",
  })
);

// Category normalization (6 buckets, in your desired order)
const CATEGORY_ALIASES = new Map(
  Object.entries({
    normal: "normal",
    normals: "normal",
    "normal ": "normal",

    targetcombo: "targetcombo",
    "target combo": "targetcombo",
    targetcombos: "targetcombo",
    target: "targetcombo",

    special: "special",
    specials: "special",

    super: "super",
    supers: "super",

    throw: "throw",
    throws: "throw",

    common: "common",
  })
);

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

function normalizeHeader(h) {
  // remove BOM and trim
  const t = String(h ?? "")
    .replace(/^\uFEFF/, "")
    .trim();
  if (!t) return "";
  const key = t.toLowerCase();
  return HEADER_ALIASES.get(key) ?? t;
}

function normalizeCategory(v) {
  const t = String(v ?? "").trim().toLowerCase();
  return CATEGORY_ALIASES.get(t) ?? (t ? "common" : "common");
}

function dedupeColumns(cols) {
  const seen = new Map();
  return cols.map((c) => {
    if (!c) return c;
    const n = seen.get(c) ?? 0;
    seen.set(c, n + 1);
    return n === 0 ? c : `${c}_${n + 1}`;
  });
}

function importOne(id) {
  const csvPath = path.join(CSV_DIR, `${id}.csv`);
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const { meta, header: rawHeader, rows } = parseCSV(
    fs.readFileSync(csvPath, "utf-8")
  );
  if (rawHeader.length === 0) throw new Error(`CSV has no header: ${csvPath}`);

  // Normalize header names (trim + alias map) and preserve column order from CSV.
  const normalizedHeader = dedupeColumns(rawHeader.map(normalizeHeader));
  const headerMap = new Map();
  for (let i = 0; i < rawHeader.length; i++) {
    headerMap.set(rawHeader[i], normalizedHeader[i]);
  }

  // Existing JSON (optional) for fallback names
  const outPath = path.join(OUT_DIR, `${id}.json`);
  const old = safeReadJSON(outPath);

  const characterId = meta.characterId || old?.characterId || id;
  const displayNameCN = meta.displayNameCN ?? old?.displayNameCN ?? "";
  const displayNameEN = meta.displayNameEN ?? old?.displayNameEN ?? "";

  // Build moves from CSV, preserving *all* columns.
  // Values are trimmed strings; missing columns are filled with "".
  const moves = rows.map((r) => {
    const m = {};
    // Copy every column based on the CSV header order
    for (let i = 0; i < rawHeader.length; i++) {
      const rawKey = rawHeader[i];
      const key = normalizedHeader[i];
      m[key] = String(r[rawKey] ?? "").trim();
    }
    // Normalize category into 6 buckets (avoid UI crash)
    if ("category" in m) m.category = normalizeCategory(m.category);
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
    // Preserve column order so the UI can render columns exactly as in the CSV
    columns: normalizedHeader,
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
