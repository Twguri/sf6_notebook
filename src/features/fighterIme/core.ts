// src/features/fighterIme/core.ts
export type FighterMode = "normal" | "fighter";

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

const BUTTON_TOKENS = [
  "ppp",
  "kkk",
  "pp",
  "kk",
  "lp",
  "mp",
  "hp",
  "lk",
  "mk",
  "hk",
] as const;

type ButtonToken = (typeof BUTTON_TOKENS)[number];

const SEP_CHARS = new Set<string>([
  " ",
  "\t",
  "\n",
  "\r",
  ",",
  ".",
  "+",
  "-",
  "/",
  "\\",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "<",
  ">",
  ":",
  ";",
]);

function isDigit1to9(ch: string) {
  return ch >= "1" && ch <= "9";
}

function isAlphaNum(ch: string) {
  return /[a-z0-9]/i.test(ch);
}

/**
 * 上下文规则：
 * 仅当 token 前面（向左跳过分隔符）最近遇到：
 * - 方向数字 1-9 或
 * - '>'
 * 才把 lp/mp/... 当作按键 token 映射。
 */
function hasTriggerContext(text: string, startIndex: number): boolean {
  let i = startIndex - 1;
  while (i >= 0) {
    const ch = text[i];

    if (SEP_CHARS.has(ch)) {
      i--;
      continue;
    }

    if (ch === ">") return true;
    if (isDigit1to9(ch)) return true;

    // 遇到普通字母/数字（例如 help 的 e/l）就停止：不算指令上下文
    if (isAlphaNum(ch)) return false;

    // 其他未知符号也停止
    return false;
  }
  return false;
}

function matchButtonToken(text: string, i: number): ButtonToken | null {
  // 不允许空格：所以只在当前位置直接匹配连续字母
  const lower = text.slice(i, i + 3).toLowerCase();

  // longest-match
  if (lower.startsWith("ppp")) return "ppp";
  if (lower.startsWith("kkk")) return "kkk";

  const lower2 = text.slice(i, i + 2).toLowerCase();
  if (lower2 === "pp") return "pp";
  if (lower2 === "kk") return "kk";
  if (lower2 === "lp") return "lp";
  if (lower2 === "mp") return "mp";
  if (lower2 === "hp") return "hp";
  if (lower2 === "lk") return "lk";
  if (lower2 === "mk") return "mk";
  if (lower2 === "hk") return "hk";

  return null;
}

/**
 * 把原始文本渲染成“显示文本”（箭头 + LP/MP...）
 * 原文不变，显示层才替换。
 */
export function renderFighterText(raw: string, mode: FighterMode): string {
  if (mode !== "fighter") return raw;

  let out = "";
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];

    // 方向数字：始终映射
    if (isDigit1to9(ch)) {
      out += DIR_MAP[ch] ?? ch;
      i += 1;
      continue;
    }

    // 尝试按键 token
    const tok = matchButtonToken(raw, i);
    if (tok) {
      // token 的上下文判定（只有方向数字或 '>' 附近才映射）
      if (hasTriggerContext(raw, i)) {
        out += tok.toUpperCase(); // 文本版：先用 LP/MP/...
        i += tok.length;
        continue;
      }
      // 没上下文：当普通文本输出
      out += raw[i];
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}
