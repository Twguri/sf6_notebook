import fs from "node:fs";
import path from "node:path";
import TOML from "toml";

const ROOT = process.cwd();
const UPSTREAM_DIR = path.join(ROOT, "vendor", "sf6-move-data", "moves");
const OUT_DIR = path.join(ROOT, "src", "data", "frameData");

/** ---------- utils ---------- */

function readText(p) {
  return fs.readFileSync(p, "utf-8");
}

function safeReadJSON(p) {
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function titleCaseId(id) {
  return id ? id[0].toUpperCase() + id.slice(1) : id;
}

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function pickString(v, fallback = "-") {
  if (v === undefined || v === null) return fallback;
  const s = String(v).trim();
  return s === "" ? fallback : s;
}

/** ---------- auto CN name for basic normals (ONLY 5/2/j) ---------- */
/**
 * 支持跳入 input 的多种写法：
 * - J.HP / j.hp
 * - j>hp / J>HP
 * - 5mp / 2mk
 * 只对这 18 个基础拳脚生效。
 */
function autoCNForBasicNormal(input) {
  if (!input) return null;

  let s = String(input).trim().toLowerCase();

  // 归一化：跳入常见分隔符 "." 和 ">" 统一去掉
  s = s.replace(/[.>]/g, "");
  s = s.replace(/\s+/g, "");

  // 现在匹配：5lp / 2mk / jhp
  const m = s.match(/^(5|2|j)(lp|mp|hp|lk|mk|hk)$/);
  if (!m) return null;

  const pos = m[1];
  const btn = m[2];

  const posCN = pos === "5" ? "站" : pos === "2" ? "下" : "跳";

  const btnCN = (() => {
    if (btn === "lp") return "轻拳";
    if (btn === "mp") return "中拳";
    if (btn === "hp") return "重拳";
    if (btn === "lk") return "轻脚";
    if (btn === "mk") return "中脚";
    if (btn === "hk") return "重脚";
    return null;
  })();

  return btnCN ? `${posCN}${btnCN}` : null;
}

/** ---------- Active formatter ---------- */
/**
 * TOML:
 *  active = [6, 9]  => "4"
 *  active = [16,17,31,32,46,47] => "2, 2, 2"
 *  active = [5,6,7,8,...,16] => "12" (compress consecutive runs)
 */
function formatActive(active) {
  if (active === undefined || active === null) return "-";
  if (typeof active === "number") return String(active);
  if (typeof active === "string") return active.trim() || "-";
  if (!Array.isArray(active)) return String(active);

  const nums = active.map(Number).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return "-";

  // Case A: intervals [start,end,start,end,...]
  const canBePairs = nums.length % 2 === 0 && nums.length >= 2;
  if (canBePairs) {
    let looksLikeAllPairs = true;
    for (let i = 0; i < nums.length; i += 2) {
      const a = nums[i], b = nums[i + 1];
      if (!(Number.isFinite(a) && Number.isFinite(b) && b >= a)) {
        looksLikeAllPairs = false;
        break;
      }
    }
    if (looksLikeAllPairs) {
      const lens = [];
      for (let i = 0; i < nums.length; i += 2) {
        const a = nums[i], b = nums[i + 1];
        lens.push(b - a + 1);
      }
      return lens.join(", ");
    }
  }

  // Case B: list of frames -> compress runs
  nums.sort((a, b) => a - b);

  const runs = [];
  let start = nums[0];
  let prev = nums[0];

  for (let i = 1; i < nums.length; i++) {
    const cur = nums[i];
    if (cur === prev + 1) {
      prev = cur;
      continue;
    }
    runs.push([start, prev]);
    start = cur;
    prev = cur;
  }
  runs.push([start, prev]);

  const lens = runs.map(([a, b]) => b - a + 1);
  return lens.join(", ");
}

/** ---------- input -> stable id (simple normals) ---------- */
function idFromSimpleInput(input) {
  if (!input) return null;
  const raw = String(input).trim().toLowerCase();

  // 同样兼容 j>hp / J.HP 等，先归一化一下
  const normalized = raw.replace(/[.>]/g, "");

  const m = normalized.match(/^(j|[1-9])\s*(lp|mp|hp|lk|mk|hk)$/i);
  if (!m) return null;

  const dir = m[1].toLowerCase();
  const btn = m[2].toLowerCase();

  if (dir === "5") return `st_${btn}`;
  if (dir === "2") return `cr_${btn}`;
  if (dir === "j") return `j_${btn}`;
  if (dir === "6") return `f_${btn}`;
  if (dir === "4") return `b_${btn}`;
  return `n${dir}_${btn}`;
}

/** ---------- type/category/hittype mappings ---------- */

function getMoveType(move) {
  return String(move.type ?? move.moveType ?? "").trim();
}

function mapTypeToCategory(move) {
  const t = getMoveType(move).toLowerCase();

  if (t === "targetcombo" || t === "target_combo" || t === "target combo")
    return "targetCombos";

  // ✅ followup 派生技也放到 specials
  if (
    t === "special" ||
    t === "followup" ||
    t === "follow_up" ||
    t === "follow-up" ||
    t === "commandthrow" ||
    t === "command_throw" ||
    t === "command throw" ||
    t === "commandtrow" // 兼容拼写
  ) {
    return "specials";
  }

  if (t === "super1" || t === "sa1") return "supers";
  if (t === "super2" || t === "sa2") return "supers";
  if (t === "super3" || t === "sa3") return "supers";

  return "normals";
}


function mapBlockTypeToHitType(blockType) {
  const t = String(blockType ?? "").trim();
  if (!t) return "-";

  const lc = t.toLowerCase();
  if (lc === "high") return "High";
  if (lc === "low") return "Low";
  if (lc === "mid") return "Overhead";
  if (lc === "midhigh") return "Overhead"; // 你希望 midHigh 显示为 Overhead
  return t;
}

function mapHitType(move) {
  const t = getMoveType(move).toLowerCase();
  if (
    t === "throw" ||
    t === "commandthrow" ||
    t === "command_throw" ||
    t === "command throw"
  ) {
    return "Throw";
  }
  return mapBlockTypeToHitType(move.blockType);
}

function mapCancel(cancel, cancelsInto) {
  if (!cancel) return "-";

  const rawArr = Array.isArray(cancel)
    ? cancel
    : String(cancel)
        .split(/[,/+\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  if (rawArr.length === 0) return "-";

  const tokens = [];

  for (const c of rawArr) {
    const x = String(c).trim().toUpperCase();

    if (x === "C") {
      tokens.push("Special", "Drive", "Super");
      continue;
    }
    if (x === "SA" || x === "SA1" || x === "SA2" || x === "SA3") {
      tokens.push("Super");
      continue;
    }
    if (x === "J") {
      tokens.push("Jump");
      continue;
    }
    if (x === "*") {
      tokens.push("Other");
      continue;
    }

    tokens.push(c);
  }

  const hasOther = tokens.includes("Other");
  let detail = "";
  if (hasOther && Array.isArray(cancelsInto) && cancelsInto.length) {
    detail = ` (${cancelsInto.slice(0, 3).join(", ")}${
      cancelsInto.length > 3 ? ", …" : ""
    })`;
  }

  const uniq = [];
  for (const t of tokens) if (!uniq.includes(t)) uniq.push(t);

  return uniq.join(", ") + detail;
}

/** ---------- TOML shape helpers ---------- */

function loadUpstreamToml(characterId) {
  const tomlPath = path.join(UPSTREAM_DIR, `${characterId}.toml`);
  if (!fs.existsSync(tomlPath)) throw new Error(`Upstream TOML not found: ${tomlPath}`);
  const raw = readText(tomlPath);
  return { tomlPath, data: TOML.parse(raw) };
}

function findMoveArray(obj) {
  if (Array.isArray(obj.moves)) return obj.moves;
  if (Array.isArray(obj.move)) return obj.move;

  for (const k of Object.keys(obj)) {
    if (Array.isArray(obj[k]) && obj[k].length && typeof obj[k][0] === "object")
      return obj[k];
  }
  return [];
}

function makeMoveId(characterId, move) {
  const byInput = idFromSimpleInput(move.input);
  if (byInput) return byInput;

  if (move.slug) return slugify(move.slug);

  const cat = mapTypeToCategory(move);
  const name = move.name ?? "move";
  return `${cat}_${slugify(name)}`;
}

function getJapaneseName(move) {
  return (
    move.name_ja ??
    move.nameJa ??
    move.nameJA ??
    move.nameJP ??
    move.jpName ??
    move.japaneseName ??
    ""
  );
}

/**
 * ✅ 新增：slugToInput 让 followup 能拼 parent input
 */
function toOurMoveRow(characterId, move, nameCNMap, slugToInput) {
  const id = makeMoveId(characterId, move);
  const category = mapTypeToCategory(move);

  const nameEN = String(move.name ?? id);
  const nameJP = getJapaneseName(move);

  // ✅ 自动三字通用名（只对站/下/跳）
  const autoCN = autoCNForBasicNormal(move.input);

  // 优先级：你手写 > 自动通用 > 日文占位
  const nameCN = nameCNMap[id] ?? autoCN ?? (nameJP ? String(nameJP) : "");

  const input = move.input ? String(move.input) : undefined;

  // ✅ followup: inputDisplay = parentInput > childInput
  let inputDisplay = undefined;
  const moveType = getMoveType(move).toLowerCase();
  if (moveType === "followup" && Array.isArray(move.parents) && move.parents.length > 0) {
    const parentSlug = String(move.parents[0]);
    const parentInput = slugToInput?.get(parentSlug);

    if (parentInput && input) {
      inputDisplay = `${parentInput}>${input}`;
    }
  }

  // Frames
  const startup = pickString(move.startup);
  const active = formatActive(move.active);
  const recovery = pickString(move.recovery);

  // Frame advantage: [moves.frameAdvantage]
  const fa = move.frameAdvantage ?? null;
  const onHit = pickString(fa?.hit);
  const onBlock = pickString(fa?.block);

  // HitType / Cancel
  const hitType = mapHitType(move);
  const cancel = mapCancel(move.cancel, move.cancelsInto);

  // Drive gauge: [moves.driveGauge]
  const dg = move.driveGauge ?? null;
  const driveOnHit = pickString(dg?.onHit);
  const driveOnBlock = pickString(dg?.onBlock);
  const driveOnPunishCounter = pickString(dg?.onPunishCounter);

  // Damage / SA gain
  const damage = pickString(move.damage);
  const superArt = pickString(move.superArt);

  return {
    id,
    nameCN,
    nameEN,
    input,
    inputDisplay, // ✅ 新增字段
    category,

    startup: String(startup),
    active: String(active),
    recovery: String(recovery),
    onBlock: String(onBlock),
    onHit: String(onHit),
    cancel: String(cancel),
    hitType: String(hitType),

    driveOnHit: String(driveOnHit),
    driveOnBlock: String(driveOnBlock),
    driveOnPunishCounter: String(driveOnPunishCounter),

    damage: String(damage),
    superArt: String(superArt),
  };
}

/** ---------- main ---------- */

function importOne(characterId) {
  const outPath = path.join(OUT_DIR, `${characterId}.json`);
  const old = safeReadJSON(outPath);

  const displayNameEN = old?.displayNameEN ?? titleCaseId(characterId);
  const displayNameCN = old?.displayNameCN ?? "";
  const nameCNMap = old?.nameCNMap ?? {}; // ✅ preserve manual CN

  const { tomlPath, data } = loadUpstreamToml(characterId);
  const upstreamMoves = findMoveArray(data);

  // ✅ 建 slug -> input 的索引，用于 followup 拼接 parent
  const slugToInput = new Map();
  for (const m of upstreamMoves) {
    if (m?.slug && m?.input) slugToInput.set(String(m.slug), String(m.input));
  }

  const moves = upstreamMoves.map((m) =>
    toOurMoveRow(characterId, m, nameCNMap, slugToInput)
  );

  const output = {
    characterId,
    displayNameCN,
    displayNameEN,
    lastUpdated: new Date().toISOString().slice(0, 10),
    nameCNMap,
    moves,
  };

  writeJSON(outPath, output);

  console.log(`✅ Imported ${characterId}: ${moves.length} moves`);
  console.log(`   from: ${tomlPath}`);
  console.log(`   to:   ${outPath}`);
}

function main() {
  const characterId = (process.argv[2] || "ryu").trim().toLowerCase();

  if (!fs.existsSync(UPSTREAM_DIR)) {
    console.error(`❌ Upstream dir not found: ${UPSTREAM_DIR}`);
    console.error(`   Make sure vendor/sf6-move-data exists (git submodule or cloned).`);
    process.exit(1);
  }

  importOne(characterId);
}

main();
