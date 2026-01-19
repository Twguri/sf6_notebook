import React, { useMemo, useState } from "react";

type MoveRow = {
  id: string;
  nameCN?: string;
  nameEN?: string;
  input?: string;
  inputDisplay?: string;
  category?: string;
  hitType?: string;
};

function digitsToArrows(s: string) {
  const map: Record<string, string> = {
    "1": "↙",
    "2": "↓",
    "3": "↘",
    "4": "←",
    "5": "·",
    "6": "→",
    "7": "↖",
    "8": "↑",
    "9": "↗",
  };
  return s.replace(/[1-9]+/g, (m) => m.split("").map((d) => map[d] ?? d).join(" "));
}

export default function MovePickerModal({
  lang,
  toggleLang,
  moves,
  onPick,
  onClose,
}: {
  lang: "zh" | "en";
  toggleLang: () => void;
  moves: MoveRow[];
  onPick: (m: MoveRow) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return moves;
    return moves.filter((m) => {
      const name = (lang === "zh" ? m.nameCN : m.nameEN) ?? "";
      const other = (lang === "zh" ? m.nameEN : m.nameCN) ?? "";
      const input = (m.inputDisplay ?? m.input ?? "") as string;
      return (
        name.toLowerCase().includes(s) ||
        other.toLowerCase().includes(s) ||
        input.toLowerCase().includes(s) ||
        (m.hitType ?? "").toLowerCase().includes(s) ||
        (m.category ?? "").toLowerCase().includes(s)
      );
    });
  }, [q, moves, lang]);

  const t = {
    title: lang === "zh" ? "选择招式" : "Pick a Move",
    ph: lang === "zh" ? "搜索：名称 / 指令 / 判定" : "Search: name / input / hit type",
    close: lang === "zh" ? "关闭" : "Close",
    empty: lang === "zh" ? "没有匹配结果" : "No results",
  };

  const S = {
    mask: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    },
    box: {
      width: "min(760px, 96vw)",
      maxHeight: "84vh",
      background: "rgba(10,10,14,0.98)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 18,
      overflow: "hidden" as const,
      boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
    },
    head: {
      height: 64,
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
      gap: 14,
      borderBottom: "1px solid rgba(255,255,255,0.10)",
    } as React.CSSProperties,
    title: { fontSize: 18, fontWeight: 900, letterSpacing: 0.3, color: "#fff" },
    langBtn: {
      marginLeft: "auto",
      height: 42,
      padding: "0 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 900,
      letterSpacing: 0.2,
    } as React.CSSProperties,
    closeBtn: {
      height: 42,
      padding: "0 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 900,
      letterSpacing: 0.2,
    } as React.CSSProperties,
    content: { padding: 12, overflow: "auto" as const, maxHeight: "calc(84vh - 64px)" },
    input: {
      width: "95%",
      minHeight: 46,
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontWeight: 800,
      fontSize: 15,
      lineHeight: 1.4,
    } as React.CSSProperties,
    row: {
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      cursor: "pointer",
      marginTop: 10,
    } as React.CSSProperties,
    name: { fontWeight: 900, color: "#fff", fontSize: 15 },
    meta: { color: "rgba(255,255,255,0.72)", fontWeight: 700, marginTop: 4, fontSize: 12 },
    mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  };

  return (
    <div style={S.mask} onClick={onClose}>
      <div style={S.box} onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <div style={S.title}>{t.title}</div>

          <button type="button" style={S.langBtn} onClick={toggleLang}>
            {lang === "zh" ? "EN" : "中"}
          </button>

          <button type="button" style={S.closeBtn} onClick={onClose}>
            {t.close}
          </button>
        </div>

        <div style={S.content}>
          <input
            style={S.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.ph}
            autoFocus
          />

          {list.length === 0 ? (
            <div style={{ marginTop: 14, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>
              {t.empty}
            </div>
          ) : (
            list.slice(0, 300).map((m) => {
              const name = (lang === "zh" ? m.nameCN : m.nameEN) ?? (m.nameEN ?? m.nameCN ?? m.id);
              const raw = (m.inputDisplay ?? m.input ?? "-") as string;
              const shown = raw === "-" ? "-" : digitsToArrows(raw);
              const meta = `${m.category ?? "-"} · ${m.hitType ?? "-"}`;

              return (
                <div key={m.id} style={S.row} onClick={() => onPick(m)} title={raw}>
                  <div style={S.name}>{name}</div>
                  <div style={{ ...S.meta, ...S.mono }}>{shown}</div>
                  <div style={S.meta}>{meta}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
