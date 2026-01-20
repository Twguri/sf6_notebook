import { useEffect, useMemo, useRef, useState } from "react";

type FighterMode = "fighter" | "normal";

type MemoEditorProps = {
  storageKey: string;
  title: string;
  placeholder?: string;
  hint?: string;

  width?: number | string;     // e.g. "70vw"
  maxWidth?: number;           // e.g. 1400
  minHeight?: number | string; // e.g. "70vh"
};

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

const ARROWS = new Set(Object.values(DIR_MAP));
const BUTTON_TOKENS = ["ppp", "kkk", "pp", "kk", "lp", "mp", "hp", "lk", "mk", "hk"] as const;

function isDigit1to9(k: string) {
  return k.length === 1 && k >= "1" && k <= "9";
}

function isWhitespace(ch: string) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

// 判断 token 左侧是否有“触发上下文”，避免普通英文误触发
function hasTriggerContext(value: string, tokenStart: number): boolean {
  // 向左跳过空白
  let i = tokenStart - 1;
  while (i >= 0 && isWhitespace(value[i])) i--;

  // 行首：允许（你要更严格就 return false）
  if (i < 0) return true;

  const ch = value[i];

  // 方向箭头 / 数字 / '>' 触发
  if (ARROWS.has(ch)) return true;
  if (ch >= "1" && ch <= "9") return true;
  if (ch === ">") return true;

  // 其他符号（比如括号、逗号）也允许触发（更宽容）
  if (!/[a-z0-9]/i.test(ch)) return true;

  // 左侧是字母数字：不触发
  return false;
}

// 在光标位置附近检测是否刚完成了 token，若是则替换为大写版本并返回新光标
function applyButtonTokenIfAny(value: string, caret: number): { value: string; caret: number } {
  // 优先匹配 3 字符 token
  const tryMatch = (len: number) => {
    if (caret < len) return null;
    const start = caret - len;
    const seg = value.slice(start, caret);
    const lower = seg.toLowerCase();
    if (!(BUTTON_TOKENS as readonly string[]).includes(lower)) return null;
    if (!hasTriggerContext(value, start)) return null;

    const replaced = lower.toUpperCase(); // 文本版映射
    const nextValue = value.slice(0, start) + replaced + value.slice(caret);
    const nextCaret = start + replaced.length;
    return { value: nextValue, caret: nextCaret };
  };

  return tryMatch(3) ?? tryMatch(2) ?? { value, caret };
}

export default function MemoEditor({
  storageKey,
  title,
  placeholder = "",
  hint = "",
  width = "100%",
  maxWidth = 980,
  minHeight = "70vh",
}: MemoEditorProps) {
  const key = useMemo(() => storageKey, [storageKey]);

  const [mode, setMode] = useState<FighterMode>("fighter");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const timerRef = useRef<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // load
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) setText(saved);
  }, [key]);

  // autosave
  useEffect(() => {
    setStatus("saving");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      localStorage.setItem(key, text);
      setStatus("saved");
    }, 400);

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [text, key]);

  const toggleMode = () => setMode((m) => (m === "fighter" ? "normal" : "fighter"));

  // 在当前光标位置插入字符串
  const insertAtCaret = (insert: string) => {
    const el = taRef.current;
    if (!el) return;

    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;

    const next = text.slice(0, start) + insert + text.slice(end);
    setText(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Alt + F（Win/Linux） / Cmd + Option + F（macOS）
    const hitToggle =
      ((e.ctrlKey && e.altKey) || (e.metaKey && e.altKey)) && e.code === "KeyF";

    if (hitToggle) {
      e.preventDefault();
      e.stopPropagation();
      toggleMode();
      return;
    }

    // Fighter 模式：数字 1-9 直接插入方向箭头（解决 caret 错位）
    if (mode === "fighter") {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (isDigit1to9(e.key)) {
        e.preventDefault();
        insertAtCaret(DIR_MAP[e.key] ?? e.key);
        return;
      }
    }
  };

  // ✅ 关键：在 onChange 里做 token 替换（lp/mp/ppp...）
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;

    // 记录当前滚动/光标（避免受控更新导致跳动）
    const st = el.scrollTop;
    const sl = el.scrollLeft;
    const ss = el.selectionStart ?? 0;
    const se = el.selectionEnd ?? ss;

    let nextValue = el.value;
    let nextCaret = ss;

    if (mode === "fighter") {
      // 只在“光标没有选区”的常规输入情况下做自动替换（更稳）
      if (ss === se) {
        const applied = applyButtonTokenIfAny(nextValue, ss);
        nextValue = applied.value;
        nextCaret = applied.caret;
      }
    }

    setText(nextValue);

    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.scrollTop = st;
      ta.scrollLeft = sl;
      // 如果发生了替换，用 nextCaret，否则用原 selection
      if (mode === "fighter" && ss === se) {
        ta.setSelectionRange(nextCaret, nextCaret);
      } else {
        ta.setSelectionRange(ss, se);
      }
    });
  };

  return (
    <div style={{ marginTop: 12}}>
      <div style={{width: "100%"}}>
        <div
          style={{
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              gap: 12,
            }}
          >
            <div style={{ color: "#eaeaea", fontWeight: 900, fontSize: 16 }}>
              {title}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                }}
                title="Toggle input mode (Ctrl+Alt+F)"
              >
                Input: {mode === "fighter" ? "Fighter" : "Normal"}
              </button>

              <div style={{ fontSize: 12, color: "#9a9a9a", whiteSpace: "nowrap" }}>
                Ctrl+Alt+F
              </div>

              <div style={{ fontSize: 12, color: "#9a9a9a", whiteSpace: "nowrap" }}>
                {status === "saving" ? "saving…" : status === "saved" ? "saved" : ""}
              </div>
            </div>
          </div>

          <textarea
            ref={taRef}
            value={text}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            style={{
              width: "100%",
              minHeight,
              padding: 16,
              borderRadius: 14,
              border: "1px solid #2a2a2a",
              background: "#0f0f0f",
              color: "#ededed",
              caretColor: "#ffffff",
              outline: "none",
              resize: "vertical",
              fontSize: 15,
              lineHeight: 1.6,
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
            }}
          />

          {hint ? (
            <div style={{ fontSize: 12, color: "#7e7e7e", marginTop: 8 }}>
              {hint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FighterTextarea({
  value,
  onChange,
  placeholder = "",
  minHeight = 120,
  style,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  style?: React.CSSProperties;
}) {
  const [mode, setMode] = useState<FighterMode>("normal");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // 在当前光标位置插入字符串
  const insertAtCaret = (insert: string) => {
    const el = taRef.current;
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;

    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Alt + F（Win/Linux） / Cmd + Option + F（macOS）
    const hitToggle =
      ((e.ctrlKey && e.altKey) || (e.metaKey && e.altKey)) && e.code === "KeyF";

    if (hitToggle) {
      e.preventDefault();
      e.stopPropagation();
      setMode((m) => (m === "fighter" ? "normal" : "fighter"));
      return;
    }

    if (mode !== "fighter") return;

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Fighter 模式：数字 1-9 直接插入方向箭头
    if (isDigit1to9(e.key)) {
      e.preventDefault();
      insertAtCaret(DIR_MAP[e.key] ?? e.key);
      return;
    }
  };

  const onChangeInner = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;

    const st = el.scrollTop;
    const sl = el.scrollLeft;
    const ss = el.selectionStart ?? 0;
    const se = el.selectionEnd ?? ss;

    let nextValue = el.value;
    let nextCaret = ss;

    if (mode === "fighter") {
      if (ss === se) {
        const applied = applyButtonTokenIfAny(nextValue, ss);
        nextValue = applied.value;
        nextCaret = applied.caret;
      }
    }

    onChange(nextValue);

    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.scrollTop = st;
      ta.scrollLeft = sl;
      if (mode === "fighter" && ss === se) ta.setSelectionRange(nextCaret, nextCaret);
      else ta.setSelectionRange(ss, se);
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 右上角模式提示（可删掉，不影响快捷键） */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 8,
          fontSize: 12,
          opacity: 0.7,
          pointerEvents: "none",
          fontWeight: 800,
        }}
      >
        {mode === "fighter" ? "Fighter (Ctrl+Alt+F)" : "Normal (Ctrl+Alt+F)"}
      </div>

      <textarea
        ref={taRef}
        value={value}
        onChange={onChangeInner}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight,
          padding: "26px 12px 10px", // 给右上角提示留空间
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          color: "#ededed",
          caretColor: "#ffffff",
          outline: "none",
          resize: "vertical",
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          ...style,
        }}
      />
    </div>
  );
}

// ===== Named export: FighterTextareaFixed (always fighter mode) =====
// ===== Named export: FighterTextareaFixed (always fighter mode) =====
export function FighterTextareaFixed({
  value,
  onChange,
  placeholder = "",
  minHeight = 80,
  style,
  textareaRef, // ✅ 新增：外部可拿到 textarea DOM
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  style?: React.CSSProperties;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>; // ✅ A 方案
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ 同时设置内部 ref + 外部 ref（返回 void，避免 TS 报错）
  const setRefs = (el: HTMLTextAreaElement | null): void => {
    taRef.current = el;
    if (textareaRef) textareaRef.current = el;
  };

  const insertAtCaret = (insert: string) => {
    const el = taRef.current;
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;

    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 固定 fighter：不允许切换
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Fighter 模式：数字 1-9 直接插入方向箭头
    if (isDigit1to9(e.key)) {
      e.preventDefault();
      insertAtCaret(DIR_MAP[e.key] ?? e.key);
      return;
    }
  };

  const onChangeInner = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;

    const st = el.scrollTop;
    const sl = el.scrollLeft;
    const ss = el.selectionStart ?? 0;
    const se = el.selectionEnd ?? ss;

    let nextValue = el.value;
    let nextCaret = ss;

    // 固定 fighter：无选区时做 token 大写
    if (ss === se) {
      const applied = applyButtonTokenIfAny(nextValue, ss);
      nextValue = applied.value;
      nextCaret = applied.caret;
    }

    onChange(nextValue);

    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;

      ta.focus();
      ta.scrollTop = st;
      ta.scrollLeft = sl;

      if (ss === se) ta.setSelectionRange(nextCaret, nextCaret);
      else ta.setSelectionRange(ss, se);
    });
  };

  return (
    <textarea
      ref={setRefs} // ✅ 原来 ref={taRef}
      value={value}
      onChange={onChangeInner}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        minHeight,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        color: "#ededed",
        caretColor: "#ffffff",
        outline: "none",
        resize: "vertical",
        fontSize: 14,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        ...style,
      }}
      lang="en"
      inputMode="text"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
    />
  );
}

