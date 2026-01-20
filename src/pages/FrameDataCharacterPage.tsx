import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import { getFrameData } from "../features/frameData/frameDataStore";
import type { MoveRow } from "../features/frameData/frameDataStore";
import MoveSearch from "../components/MoveSearch";


type MoveCategory = "normals" | "targetCombos" | "specials" | "supers";

const SECTION_META: Array<{
  key: MoveCategory;
  titleCN: string;
  titleEN: string;
}> = [
  { key: "normals", titleCN: "普通拳脚", titleEN: "Normals" },
  { key: "targetCombos", titleCN: "Target Combo", titleEN: "Target Combos" },
  { key: "specials", titleCN: "必杀技", titleEN: "Special Moves" },
  { key: "supers", titleCN: "超级必杀技", titleEN: "Super Arts" },
];

/** -----------------------------
 *  numpad -> arrows (display only)
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

// 解析按钮：lplk -> LPLK, pp -> PP, p -> P
function formatButtons(btn: string) {
  const s = btn.toLowerCase();

  // 先处理最常见的 pp/kk
  if (s === "pp") return "PP";
  if (s === "kk") return "KK";
  if (s === "p") return "P";
  if (s === "k") return "K";

  // parse sequences like lplk / mp / hp / lk...
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (["lp", "mp", "hp", "lk", "mk", "hk"].includes(two)) {
      tokens.push(two.toUpperCase());
      i += 2;
      continue;
    }
    const one = s[i];
    if (one === "p" || one === "k") {
      tokens.push(one.toUpperCase());
      i += 1;
      continue;
    }
    i += 1;
  }
  return tokens.length ? tokens.join("") : btn.toUpperCase();
}

function isSingleDigitDir(dirs: string) {
  return /^[1-9]$/.test(dirs);
}

function dirsToArrows(dirs: string) {
  return dirs
    .split("")
    .map((d) => DIR_MAP[d] ?? d)
    .join(" ");
}

/**
 * 支持输入格式：
 * - 236mp
 * - 236(pp)
 * - (4lplk)
 * - (lplk)
 * - 5hp>5hk  （TC 展示：•HP>•HK）
 * - {360}+p / {720}+*p （显示 360/720，并去掉 *）
 */
function formatOneChunk(chunkRaw: string, lang: "zh" | "en") {
  let s = chunkRaw.trim();
  if (!s) return "-";

  // 去掉星号标记：{720}+*p -> {720}+p
  s = s.replace(/\*/g, "");

  // 去掉空格（让 236 (pp) 也能解析）
  s = s.replace(/\s+/g, "");

  // 如果是整段括号包裹：(4lplk) / (lplk)
  if (s.startsWith("(") && s.endsWith(")")) {
    s = s.slice(1, -1);
  }
  // dirs + button hold: 214[lp] / 236[*p]
const dirHold = s.match(/^([1-9]+)\[(\*?)(lp|mp|hp|lk|mk|hk|p|k|pp|kk)\]$/i);
if (dirHold) {
  const dirs = dirHold[1];
  const label = lang === "zh" ? "蓄力" : "charge";
  const btn = formatButtons(dirHold[3]);
  return `${dirsToArrows(dirs)} + ${btn}(${label})`;
}
// ---- bracket dir+button hold: [6p] / [4lp] / [6pp] ----
// 显示：→ + P(蓄力) / ← + LP(蓄力)
const bracketDirHold = s.match(/^\[([1-9])(\*?)(lp|mp|hp|lk|mk|hk|p|k|pp|kk)\]$/i);
if (bracketDirHold) {
  const dir = bracketDirHold[1];
  const label = lang === "zh" ? "蓄力" : "charge";
  const btn = formatButtons(bracketDirHold[3]);
  const arrow = DIR_MAP[dir] ?? dir;
  return `${arrow} + ${btn}(${label})`;
}

  // ---- button hold: [lp] / [*p] / [pp] ----
  // 显示：LP(蓄力) / P(蓄力)（英文：LP(charge)）
  const holdBtn = s.match(/^\[(\*?)(lp|mp|hp|lk|mk|hk|p|k|pp|kk)\]$/i);
  if (holdBtn) {
    const label = lang === "zh" ? "蓄力" : "charge";
    const btn = formatButtons(holdBtn[2]); // 会把 pp -> PP, lp -> LP
    return `${btn}(${label})`;
  }

  // ---- charge: [4]>6lp / [4]>6(pp) / [4]>6p ----
  // 规则：显示成 ←(charge)→ + LP（中文 charge=蓄力）
  const charge = s.match(/^\[(\d)\]>(\d)(.+)$/i);
  if (charge) {
    const from = charge[1]; // usually 4 or 1 (down-back)
    const to = charge[2];   // usually 6 or 8 (up)
    let rest = charge[3] ?? "";

    // rest might be (pp)
    if (rest.startsWith("(") && rest.endsWith(")")) rest = rest.slice(1, -1);

    const fromArrow = DIR_MAP[from] ?? from;
    const toArrow = DIR_MAP[to] ?? to;
    const label = lang === "zh" ? "蓄力" : "charge";
    const btn = rest ? formatButtons(rest) : "";

    // 你想要“←(charge)→”这种风格
    const core = `${fromArrow}(${label})${toArrow}`;
    return btn ? `${core} + ${btn}` : core;
  }
  // 处理 {360} / {720}
  // 允许：{720}+p、{360}pp、{720}(pp)
  const brace = s.match(/^\{(360|720)\}(?:\+)?(.+)?$/i);
  if (brace) {
    const spin = brace[1];
    const rest = brace[2] ?? "";
    if (!rest) return spin;

    // rest 可能是 (pp) 或 pp 或 lplk
    const restBtn =
      rest.startsWith("(") && rest.endsWith(")")
        ? rest.slice(1, -1)
        : rest;

    const btn = restBtn ? formatButtons(restBtn) : "";
    return btn ? `${spin}+${btn}` : spin;
  }

  // 处理形如：236(pp)
  const parenBtn = s.match(/^([1-9]+)\(([^)]+)\)$/i);
  if (parenBtn) {
    const dirs = parenBtn[1];
    const btn = formatButtons(parenBtn[2]);
    return `${dirsToArrows(dirs)} + ${btn}`;
  }

  // 常规：([dirs])?([buttons])?
  // e.g. 236mp / 4lplk / lplk / pp / 214214p
  const m = s.toLowerCase().match(/^([1-9]+)?([a-z]+)?$/);
  if (!m) return chunkRaw.trim();

  const dirs = m[1] ?? "";
  const btnRaw = m[2] ?? "";

  const btn = btnRaw ? formatButtons(btnRaw) : "";

  if (!dirs && btn) return btn;
  if (!btn && dirs) return dirsToArrows(dirs);

  if (dirs && btn) {
    // TC 里常见：5hp / 2mk 你希望显示成 “•HP” / “↓ + MK”？
    // 你明确要求 TC: 5hp>5hk -> •HP>•HK
    // 所以：单个方向数字 + 单个攻击按钮时，拼成 “•HP”（不加 +）
    if (isSingleDigitDir(dirs)) {
      return `${DIR_MAP[dirs]}${btn}`;
    }
    // 多位方向（236/214/623 等）用 “箭头 + 按键”
    return `${dirsToArrows(dirs)} + ${btn}`;
  }

  return chunkRaw.trim();
}

function formatInput(input: string | undefined, lang: "zh" | "en") {
  if (!input) return "-";
  const raw = input.trim();
  if (!raw) return "-";

  // Target Combo: 5hp>5hk 等
  // 按你的要求，不要空格：•HP>•HK
  if (raw.includes(">")) {
    return raw
      .split(">")
      .map((x) => formatOneChunk(x,lang))
      .join(">");
  }

  return formatOneChunk(raw,lang);
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

  // 兜底：如果数据层仍然传 midHigh，就强制当 Overhead（你说英文现在错）
  midHigh: { zh: "中段", en: "Overhead" },
  MidHigh: { zh: "中段", en: "Overhead" },

  Strike: { zh: "打击", en: "Strike" },
};

function translateHitType(value: string, lang: "zh" | "en") {
  if (!value || value === "-") return "-";
  const key = value.trim();
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

  const parts = value
    .split(/[,/＋+]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const translated = parts.map((p) => CANCEL_TOKEN_DICT[p]?.zh ?? p);
  return translated.join("，");
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

function MoveTable({ rows, lang }: { rows: MoveRow[]; lang: "zh" | "en" }) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 1340,
        }}
      >
        <thead>
          <tr>
            {[
              lang === "zh" ? "招式" : "Move",
              lang === "zh" ? "指令" : "Input",
              lang === "zh" ? "判定" : "Hit Type",
              lang === "zh" ? "发动" : "Startup",
              lang === "zh" ? "打击" : "Active",
              lang === "zh" ? "收招" : "Recovery",
              lang === "zh" ? "打防" : "On Block",
              lang === "zh" ? "打中" : "On Hit",

              lang === "zh" ? "斗气(中)" : "DG On Hit",
              lang === "zh" ? "斗气(防)" : "DG On Block",
              lang === "zh" ? "斗气(确反)" : "DG Punish",

              lang === "zh" ? "伤害" : "Damage",
              lang === "zh" ? "能量回收" : "SA Gain",

              lang === "zh" ? "取消" : "Cancel",
            ].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 750,
                  letterSpacing: 0.3,
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.78)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((m) => (
            <tr
              key={m.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <td style={tdStrong}>{lang === "zh" ? m.nameCN : m.nameEN}</td>

              <td style={tdMono}>{formatInput(m.input,lang)}</td>

              <td style={tdMono}>{translateHitType(m.hitType, lang)}</td>

              <td style={tdMono}>{m.startup}</td>
              <td style={tdMono}>{m.active}</td>
              <td style={tdMono}>{m.recovery}</td>
              <td style={tdMono}>{m.onBlock}</td>
              <td style={tdMono}>{m.onHit}</td>

              <td style={tdMono}>{(m as any).driveOnHit ?? "-"}</td>
              <td style={tdMono}>{(m as any).driveOnBlock ?? "-"}</td>
              <td style={tdMono}>{(m as any).driveOnPunishCounter ?? "-"}</td>

              <td style={tdMono}>{(m as any).damage ?? "-"}</td>
              <td style={tdMono}>{(m as any).superArt ?? "-"}</td>

              <td style={tdMono}>{translateCancel(m.cancel, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

  const grouped = useMemo(() => {
    const g: Record<MoveCategory, MoveRow[]> = {
      normals: [],
      targetCombos: [],
      specials: [],
      supers: [],
    };
    for (const m of data.moves) g[m.category].push(m);
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
        <MoveSearch
          moves={data.moves}
          lang={lang}
          t={t}
          onSelect={(move) => {
            // 现在先做“跳到该分类并高亮/定位”也行，
            // 最简单先 console.log，未来连招界面直接复用 onSelect
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
              <MoveTable rows={rows} lang={lang} />
            </Section>
          );
        })}
      </div>
    </AppShell>
  );
}
