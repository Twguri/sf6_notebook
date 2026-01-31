import React, { useEffect, useMemo, useRef, useState } from "react";

type FighterMode = "fighter" | "normal";

type MemoEditorProps = {
  storageKey: string;
  title: string;
  placeholder?: string;
  hint?: string;

  width?: number | string; // e.g. "70vw"
  maxWidth?: number; // e.g. 1400
  minHeight?: number | string; // e.g. "70vh"

  /**
   * External trigger to toggle input mode (same as Ctrl+Alt+F).
   * Increment/change this value to trigger a toggle.
   * If omitted, MemoEditor behaves exactly as before.
   */
  externalToggleNonce?: number;
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

// Avoid accidentally uppercasing normal English words (e.g. "help").
function hasTriggerContext(value: string, tokenStart: number): boolean {
  let i = tokenStart - 1;
  while (i >= 0 && isWhitespace(value[i])) i--;

  if (i < 0) return true;

  const ch = value[i];
  if (ARROWS.has(ch)) return true;
  if (ch >= "1" && ch <= "9") return true;
  if (ch === ">") return true;

  // Symbol/punctuation triggers are allowed (more tolerant)
  if (!/[a-z0-9]/i.test(ch)) return true;

  return false;
}

function applyButtonTokenIfAny(value: string, caret: number): { value: string; caret: number } {
  const tryMatch = (len: number) => {
    if (caret < len) return null;
    const start = caret - len;
    const seg = value.slice(start, caret);
    const lower = seg.toLowerCase();
    if (!(BUTTON_TOKENS as readonly string[]).includes(lower)) return null;
    if (!hasTriggerContext(value, start)) return null;

    const replaced = lower.toUpperCase();
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
  externalToggleNonce,
}: MemoEditorProps) {
  const key = useMemo(() => storageKey, [storageKey]);

  const [mode, setMode] = useState<FighterMode>("fighter");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const timerRef = useRef<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const toggleMode = () => setMode((m) => (m === "fighter" ? "normal" : "fighter"));

  // External toggle (same behavior as Ctrl+Alt+F)
  useEffect(() => {
    if (externalToggleNonce === undefined) return;
    toggleMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalToggleNonce]);

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
    const hitToggle =
      ((e.ctrlKey && e.altKey) || (e.metaKey && e.altKey)) && e.code === "KeyF";

    if (hitToggle) {
      e.preventDefault();
      e.stopPropagation();
      toggleMode();
      return;
    }

    // Fighter mode: digits -> arrows
    if (mode === "fighter") {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (isDigit1to9(e.key)) {
        e.preventDefault();
        insertAtCaret(DIR_MAP[e.key] ?? e.key);
        return;
      }
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

    setText(nextValue);

    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.scrollTop = st;
      ta.scrollLeft = sl;

      if (mode === "fighter" && ss === se) {
        ta.setSelectionRange(nextCaret, nextCaret);
      } else {
        ta.setSelectionRange(ss, se);
      }
    });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ width: width, maxWidth, margin: "0 auto" }}>
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
  textareaRef,
  toggleNonce,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  style?: React.CSSProperties;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  /** External trigger to toggle mode (same effect as Ctrl+Alt+F) */
  toggleNonce?: number;
}) {
  const [mode, setMode] = useState<FighterMode>("normal");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // expose textarea DOM
  const setRefs = (el: HTMLTextAreaElement | null): void => {
    taRef.current = el;
    if (textareaRef) textareaRef.current = el;
  };

  // external toggle (same as Ctrl+Alt+F)
  useEffect(() => {
    if (toggleNonce === undefined) return;
    setMode((m) => (m === "fighter" ? "normal" : "fighter"));
  }, [toggleNonce]);

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
        ref={setRefs}
        value={value}
        onChange={onChangeInner}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight,
          padding: "26px 12px 10px",
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

/**
 * FighterTextareaFixed: always in fighter mode.
 * Used for cases where you don't want mode switching, but still want digits->arrows and token auto-uppercase.
 */
export function FighterTextareaFixed({
  value,
  onChange,
  placeholder = "",
  minHeight = 80,
  style,
  textareaRef,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  style?: React.CSSProperties;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

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
    if (e.ctrlKey || e.metaKey || e.altKey) return;

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
      ref={setRefs}
      value={value}
      onChange={onChangeInner}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        minHeight,
        padding: "12px 12px",
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
  );
}
