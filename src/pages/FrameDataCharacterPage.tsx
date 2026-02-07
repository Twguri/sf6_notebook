import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import MoveSearch from "../components/MoveSearch";
import { getFrameData } from "../features/frameData/frameDataStore";
import type { MoveRow } from "../features/frameData/frameDataStore";

type MoveCategory =
  | "normal"
  | "targetcombo"
  | "special"
  | "super"
  | "throw"
  | "common";

// The JSON preserves *all* columns; moves can carry arbitrary keys.
type AnyMoveRow = MoveRow & Record<string, any>;

// Category order matters: we render sections in this order.
const SECTION_META: Array<{
  key: MoveCategory;
  titleCN: string;
  titleEN: string;
}> = [
  { key: "normal", titleCN: "普通技", titleEN: "Normal" },
  { key: "targetcombo", titleCN: "TC", titleEN: "Target Combo" },
  { key: "special", titleCN: "必杀技", titleEN: "Special" },
  { key: "super", titleCN: "超必杀", titleEN: "Super" },
  { key: "throw", titleCN: "投技", titleEN: "Throw" },
  { key: "common", titleCN: "通用", titleEN: "Common" },
];

/** -----------------------------
 *  numpad -> arrows (display only)
 *
 *  input 已经被标准化：
 *  - 只做数字方向 1-9 -> 箭头
 *  - 只特判 {360}
 *  - 其余不做模糊解析，保留原字符（例如 > / + ( ) 等）
 *  ----------------------------- */
const DIR_MAP: Record<string, string> = {
  "1": "↙",
  "2": "↓",
  "3": "↘",
  "4": "←",
  "5": "•",
  "6": "→",
  "7": "↖",
  "8": "↑",
  "9": "↗",
};

// 输入显示模式切换：
// - num: 仅处理 {360}，保留数字和其它符号
// - dir: 在 num 的基础上做 1-9 -> 方向箭头
function formatInputWithMode(input: string | undefined, mode: "dir" | "num") {
  if (!input) return "-";
  const raw = String(input);
  if (!raw.trim()) return "-";

  // {360} 特判：仅去掉花括号，保留其它字符
  let s = raw.replace(/\{360\}/gi, "360");

  if (mode === "num") return s;

  // 数字方向 1-9 -> 箭头。逐字符替换，保留其它字符。
  s = s.replace(/[1-9]/g, (d) => DIR_MAP[d] ?? d);
  return s;
}

/** -----------------------------
 *  判定翻译（按你这份字典）
 *  ----------------------------- */
const HITTYPE_DICT: Record<string, { zh: string; en: string }> = {
  High: { zh: "上段", en: "High" },
  Mid: { zh: "中段", en: "Mid" },
  Low: { zh: "下段", en: "Low" },
  Throw: { zh: "投技", en: "Throw" },
  Projectile: { zh: "飞道", en: "Projectile" },

  Overhead: { zh: "中段", en: "Overhead" },
  midHigh: { zh: "中段", en: "Overhead" },
  MidHigh: { zh: "中段", en: "Overhead" },

  Strike: { zh: "打击", en: "Strike" },
};

function translateHitType(value: string, lang: "zh" | "en") {
  if (!value || value === "-") return "-";
  const key = String(value).trim();
  const entry = HITTYPE_DICT[key];
  if (!entry) return value;
  return lang === "zh" ? entry.zh : entry.en;
}

/** -----------------------------
 *  取消翻译（按你这份字典）
 *  ----------------------------- */
const CANCEL_TOKEN_DICT: Record<string, { zh: string; en: string }> = {
  Chain: { zh: "TC取消", en: "Chain" },
  Special: { zh: "必杀取消", en: "Special" },
  Super: { zh: "超必杀取消", en: "Super" },
  Drive: { zh: "绿冲取消", en: "Drive" },
  Jump: { zh: "跳跃取消", en: "Jump" },
  Other: { zh: "其他取消", en: "Other" },
};

function translateCancel(value: string, lang: "zh" | "en") {
  if (!value || value === "-") return "-";
  if (lang === "en") return value;

  const parts = String(value)
    .split(/[,/＋+]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const translated = parts.map((p) => CANCEL_TOKEN_DICT[p]?.zh ?? p);
  return translated.join("，");
}

/** -----------------------------
 *  Properties 翻译
 *  规则：保留符号，只翻译文本 token。
 *  特判：只要出现 "Mid-air" + "Projectile"（允许中间用空格或 '-'），
 *        中文一律显示“空中波动”。
 *  ----------------------------- */
const PROPERTIES_TOKEN_DICT: Record<string, { zh: string; en: string }> = {
  High: { zh: "上段", en: "High" },
  Mid: { zh: "中段", en: "Mid" },
  Low: { zh: "下段", en: "Low" },
  Throw: { zh: "投技", en: "Throw" },
  Projectile: { zh: "波动", en: "Projectile" },
  "Mid-air": { zh: "空中", en: "Mid-air" },
  Midair: { zh: "空中", en: "Mid-air" },
};

function tokenizeKeepSymbols(s: string) {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const isLetter = (c: string) => /[A-Za-z]/.test(c);

    if (isLetter(ch)) {
      let j = i + 1;
      while (j < s.length) {
        const c = s[j];
        if (
          c === "-" &&
          j + 1 < s.length &&
          isLetter(s[j - 1]) &&
          isLetter(s[j + 1])
        ) {
          j++;
          continue;
        }
        if (!isLetter(c)) break;
        j++;
      }
      out.push(s.slice(i, j));
      i = j;
      continue;
    }

    out.push(ch);
    i++;
  }
  return out;
}

function translateConcatHighMidLow(word: string, lang: "zh" | "en") {
  const parts = word.match(/High|Mid|Low|Throw/g);
  if (!parts) return null;
  if (parts.join("") !== word) return null;
  if (lang === "en") return word;
  return parts
    .map((p) => PROPERTIES_TOKEN_DICT[p]?.zh ?? p)
    .join(">")
    .replace(/>\s*/g, ">");
}

function translateProperties(value: string, lang: "zh" | "en") {
  if (!value || value === "-") return "-";
  const raw = String(value).trim();
  if (!raw) return "-";

  if (lang === "zh") {
    const normalized = raw.replace(/\s+/g, " ");
    const hasMidAir = /mid-?air/i.test(normalized);
    const hasProjectile = /projectile/i.test(normalized);
    if (hasMidAir && hasProjectile) return "空中波动";
  }

  const tokens = tokenizeKeepSymbols(raw);
  const translated = tokens.map((tok) => {
    if (!/^[A-Za-z][A-Za-z-]*$/.test(tok)) return tok;

    const concat = translateConcatHighMidLow(tok, lang);
    if (concat) return concat;

    const entry = PROPERTIES_TOKEN_DICT[tok];
    if (!entry) return tok;
    return lang === "zh" ? entry.zh : entry.en;
  });

  return translated.join("");
}

/** -----------------------------
 *  UI components
 *  ----------------------------- */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 12,
          paddingLeft: 12,
          borderLeft: "4px solid rgba(255,255,255,0.35)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const COLUMN_LABELS: Record<string, { zh: string; en: string }> = {
  id: { zh: "ID", en: "ID" },
  category: { zh: "类别", en: "Category" },
  __name: { zh: "名称", en: "Name" },
  input: { zh: "指令", en: "Input" },
  hitType: { zh: "判定", en: "Hit Type" },
  startup: { zh: "发动", en: "Startup" },
  active: { zh: "打击", en: "Active" },
  recovery: { zh: "收招", en: "Recovery" },
  onHit: { zh: "打中", en: "On Hit" },
  onBlock: { zh: "打防", en: "On Block" },
  damage: { zh: "伤害", en: "Damage" },
  comboScaling: { zh: "修正", en: "Combo Scaling" },
  driveOnHit: { zh: "斗气(打中)", en: "DG On Hit" },
  driveOnBlock: { zh: "斗气(打防)", en: "DG On Block" },
  driveOnPunishCounter: { zh: "斗气(确反康)", en: "DG Punish" },
  superArt: { zh: "必杀槽回收", en: "SA Gain" },
  cancel: { zh: "取消", en: "Cancel" },
  properties: { zh: "攻击判定", en: "Properties" },
  Properties: { zh: "攻击判定", en: "Properties" },
  misc: { zh: "杂项", en: "Misc" },
  Miscellaneous: { zh: "杂项", en: "Misc" },
  __notes: { zh: "备注", en: "Notes" },
};

function buildDisplayColumns(columns: string[]) {
  // 需求：招式名称列固定在最左侧。
  const out: string[] = ["__name"];
  let hasNotes = false;

  for (const c of columns) {
    if (!c) continue;

    // name* 已经映射到 __name（且 __name 已经在最左侧）
    if (c === "nameEN" || c === "nameCN") continue;

    if (c === "notesEN" || c === "notesCN") {
      if (!hasNotes) out.push("__notes");
      hasNotes = true;
      continue;
    }

    // 避免重复插入 __name
    if (c === "__name") continue;

    out.push(c);
  }

  return out;
}

function labelForColumn(col: string, lang: "zh" | "en") {
  const meta = COLUMN_LABELS[col];
  if (!meta) return col;
  return lang === "zh" ? meta.zh : meta.en;
}

function valueForCell(
  m: AnyMoveRow,
  col: string,
  lang: "zh" | "en",
  inputView: "dir" | "num"
) {
  const v = (key: string) => {
    const raw = m?.[key];
    const s = raw == null ? "" : String(raw);
    return s.trim() ? s : "-";
  };

  switch (col) {
    case "__name":
      return lang === "zh" ? v("nameCN") : v("nameEN");
    case "__notes":
      return lang === "zh" ? v("notesCN") : v("notesEN");
    case "input":
      return formatInputWithMode(m.input, inputView);
    case "hitType":
      return translateHitType(v("hitType"), lang);
    case "cancel":
      return translateCancel(v("cancel"), lang);
    case "properties":
    case "Properties":
      return translateProperties(v(col), lang);
    default:
      return v(col);
  }
}

function normalizeCategory(raw: any): MoveCategory {
  const t = String(raw ?? "").trim();
  if (!t) return "common";

  // new format
  if (
    t === "normal" ||
    t === "targetcombo" ||
    t === "special" ||
    t === "super" ||
    t === "throw" ||
    t === "common"
  ) {
    return t;
  }

  // legacy format
  if (t === "normals") return "normal";
  if (t === "targetCombos") return "targetcombo";
  if (t === "specials") return "special";
  if (t === "supers") return "super";

  return "common";
}

function MoveTable({
  rows,
  columns,
  lang,
  inputView,
  onToggleInputView,
}: {
  rows: AnyMoveRow[];
  columns: string[];
  lang: "zh" | "en";
  inputView: "dir" | "num";
  onToggleInputView: () => void;
}) {
  const displayColumns = useMemo(() => buildDisplayColumns(columns), [columns]);
  const minWidth = Math.max(720, displayColumns.length * 130);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {/* 右上角：输入显示切换（不影响搜索功能） */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px 12px 0 12px",
        }}
      >
        <button
          type="button"
          onClick={onToggleInputView}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.20)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontSize: 13,
            fontWeight: 650,
          }}
          title={
            inputView === "dir"
              ? lang === "zh"
                ? "切换为数字显示"
                : "Switch to numbers"
              : lang === "zh"
              ? "切换为方向显示"
              : "Switch to directions"
          }
        >
          {lang === "zh"
            ? inputView === "dir"
              ? "输入：方向"
              : "输入：数字"
            : inputView === "dir"
            ? "Input: Directions"
            : "Input: Numbers"}
        </button>
      </div>

      {/* 表格滚动容器：同时支持横向+纵向滚动，表头 sticky 才会生效 */}
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "70vh",
          padding: 0,
          position : "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth,
          }}
        >
          <thead>
            <tr>
              {displayColumns.map((col) => {
                const isName = col === "__name";
                return (
                  <th
                    key={col}
                    style={{
                      ...thStickyTop,
                      textAlign: "left",
                      fontSize: 13,
                      fontWeight: 750,
                      letterSpacing: 0.3,
                      padding: "20px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.78)",
                      whiteSpace: "nowrap",
                      ...(isName
                        ? { ...thStickyLeft, ...thNameCol }
                        : undefined),
                    }}
                  >
                    {labelForColumn(col, lang)}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((m, idx) => {
              const key = String(m.id || `${idx}`);
              return (
                <tr
                  key={key}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {displayColumns.map((col) => {
                    const cell = valueForCell(m, col, lang, inputView);

                    const style =
                      col === "__name"
                        ? { ...tdStrong, ...tdStickyLeft, ...tdNameCol }
                        : col === "__notes"
                        ? tdNotes
                        : tdMono;

                    return (
                      <td key={col} style={style}>
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tdMono: React.CSSProperties = {
  padding: "12px 14px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 15,
  color: "rgba(255,255,255,0.92)",
  whiteSpace: "nowrap",
};

const tdStrong: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 700,
  color: "rgba(255,255,255,0.97)",
  whiteSpace: "nowrap",
};

// 备注列：限定宽度，允许换行
const tdNotes: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "rgba(255,255,255,0.92)",
  whiteSpace: "normal",
  maxWidth: 280,
  width: 280,
  overflowWrap: "anywhere",
  lineHeight: 1.35,
};

// ----------------------
// 新增：最左列宽度限制
// ----------------------
const NAME_COL_WIDTH = 180; // 你想更窄就 180/200，更宽就 240/260

const thNameCol: React.CSSProperties = {
  width: NAME_COL_WIDTH,
  minWidth: NAME_COL_WIDTH,
  maxWidth: NAME_COL_WIDTH,
};

const tdNameCol: React.CSSProperties = {
  width: NAME_COL_WIDTH,
  minWidth: NAME_COL_WIDTH,
  maxWidth: NAME_COL_WIDTH,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  lineHeight: 1.25,
};

// 表头 sticky 到顶部（在表格滚动容器内生效）
const THEAD_HEIGHT = 50; // 👈 你可以试 40 / 44 / 48

const thStickyTop: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 10,               // 提高层级，确保压住 tbody
  height: THEAD_HEIGHT,     // 👈 黑条高度
  lineHeight: `${THEAD_HEIGHT}px`, // 垂直居中
  padding: "0 14px",        // 取消上下 padding，避免高度叠加
  background: "rgba(18,18,18,1)", // 不要透明
};

// 左侧固定列（招式名称）
const thStickyLeft: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 11, // 比普通表头更高一点，避免交叉时被盖住
  background: "rgba(18,18,18,0.98)",
};

const tdStickyLeft: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  background: "rgba(18,18,18,0.92)",
};

export default function FrameDataCharacterPage({
  lang,
  toggleLang,
  t,
}: {
  lang: "zh" | "en";
  toggleLang: () => void;
  t: (key: string) => string;
}) {
  const { id } = useParams();
  const data = id ? getFrameData(id) : null;

  // 输入显示模式：方向箭头 / 数字
  const [inputView, setInputView] = React.useState<"dir" | "num">("dir");

  if (!data) {
    return (
      <AppShell
        title={t("framesTitle")}
        lang={lang}
        toggleLang={toggleLang}
        backTo={id ? `/c/${id}` : "/"}
        backLabel={t("back")}
      >
        <div style={{ padding: 16, opacity: 0.9, fontSize: 16 }}>
          {lang === "zh"
            ? "该角色帧数数据尚未收录。你可以在 src/data/frameData/ 下添加对应的 JSON 文件。"
            : "Frame data for this character is not added yet. Add its JSON file under src/data/frameData/."}
        </div>
      </AppShell>
    );
  }

  const columns: string[] = (
    (data as any).columns && Array.isArray((data as any).columns)
      ? (data as any).columns
      : Object.keys(((data as any).moves?.[0] as any) ?? {})
  ).filter((c: string) => c !== "id" && c !== "category");

  const grouped = useMemo(() => {
    const g: Record<MoveCategory, AnyMoveRow[]> = {
      normal: [],
      targetcombo: [],
      special: [],
      super: [],
      throw: [],
      common: [],
    };

    for (const mm of (data as any).moves as AnyMoveRow[]) {
      const key = normalizeCategory(mm.category);
      g[key].push(mm);
    }

    return g;
  }, [data.moves]);

  return (
    <AppShell
      title={t("framesTitle")}
      lang={lang}
      toggleLang={toggleLang}
      backTo={id ? `/c/${id}` : "/"}
      backLabel={t("back")}
    >
      <div style={{ padding: 16 }}>
        {/* 搜索功能保持不动 */}
        <MoveSearch
          moves={data.moves}
          lang={lang}
          t={t}
          onSelect={(move) => {
            console.log("selected", move);
          }}
        />

        {SECTION_META.map((sec) => {
          const rows = grouped[sec.key];
          if (!rows || rows.length === 0) return null;

          return (
            <Section
              key={sec.key}
              title={lang === "zh" ? sec.titleCN : sec.titleEN}
            >
              <MoveTable
                rows={rows}
                columns={columns}
                lang={lang}
                inputView={inputView}
                onToggleInputView={() =>
                  setInputView((v) => (v === "dir" ? "num" : "dir"))
                }
              />
            </Section>
          );
        })}
      </div>
    </AppShell>
  );
}
