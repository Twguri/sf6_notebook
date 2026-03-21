import React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  lang: "zh" | "en";
  onClose: () => void;
};

const DIR = [
  { n: "7", arrow: "↖", zh: "后上", en: "Up-Back" },
  { n: "8", arrow: "↑", zh: "上", en: "Up" },
  { n: "9", arrow: "↗", zh: "前上", en: "Up-Forward" },
  { n: "4", arrow: "←", zh: "后", en: "Back" },
  { n: "5", arrow: "•", zh: "回中", en: "Neutral" },
  { n: "6", arrow: "→", zh: "前", en: "Forward" },
  { n: "1", arrow: "↙", zh: "后下", en: "Down-Back" },
  { n: "2", arrow: "↓", zh: "下", en: "Down" },
  { n: "3", arrow: "↘", zh: "前下", en: "Down-Forward" },
];

export default function InputLegendModal({ open, lang, onClose }: Props) {
  const isZh = lang === "zh";
  const T = (zh: string, en: string) => (isZh ? zh : en);

  // ESC close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // lock body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 999999,
    background: "rgba(0,0,0,0.50)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  };

  const panelStyle: React.CSSProperties = {
    width: "min(860px, 100%)",
    maxHeight: "min(82dvh, 760px)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.08), rgba(0,0,0,0.35)), rgba(10,10,14,0.92)",
    boxShadow: "0 30px 120px rgba(0,0,0,0.70)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const headerStyle: React.CSSProperties = {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.92)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 0.2,
  };

  const closeBtnStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 750,
  };

  const bodyStyle: React.CSSProperties = {
    padding: 16,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 850,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 8,
  };

  const textStyle: React.CSSProperties = {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.55,
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "2px 6px",
    borderRadius: 8,
    color: "rgba(255,255,255,0.92)",
  };

  const modal = (
    <div
      style={overlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={panelStyle} onWheel={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={titleStyle}>{T("输入符号说明", "Input Legend")}</div>
          <button style={closeBtnStyle} onClick={onClose}>
            {T("关闭", "Close")}
          </button>
        </div>

        <div style={bodyStyle}>
          {/* 方向 */}
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={cardTitleStyle}>
              {T("方向（小键盘 1–9）", "Directions (Numpad 1–9)")}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {DIR.map((d) => (
                <div
                  key={d.n}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.18)",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ ...textStyle, fontWeight: 800 }}>
                      <span style={codeStyle}>{d.n}</span>{" "}
                      <span style={{ opacity: 0.85 }}>
                        {isZh ? d.zh : d.en}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                      {T("对应方向箭头", "Maps to arrow")}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.92)" }}>
                    {d.arrow}
                  </div>
                </div>
              ))}
            </div>

            <div style={textStyle}>
              {T("例：", "Example: ")}
              <span style={codeStyle}>236P</span>{" "}
              {T("显示为", "shows as")}{" "}
              <span style={codeStyle}>↓↘→P</span>
            </div>
            <div style={textStyle}>
              {T("注意: 所有指令默认1P位置(左边)方向", "notice: all direction inputs are under 1P position(left)")}{" "}
            </div>
          </div>

          {/* 360/720 */}
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={cardTitleStyle}>{T("转圈指令", "Rotation Inputs")}</div>
            <div style={textStyle}>
              <div style={{ marginBottom: 8 }}>
                <span style={codeStyle}>{"{360}"}</span>{" "}
                {T("一圈（360°）指令，显示时保持为", "360° rotation input; stays as")}{" "}
                <span style={codeStyle}>{"{360}"}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={codeStyle}>{"{720}"}</span>{" "}
                {T("两圈（720°）指令，显示时保持为", "720° rotation input; stays as")}{" "}
                <span style={codeStyle}>{"{720}"}</span>
              </div>
            </div>
          </div>

          {/* charge */}
          <div style={{ ...cardStyle, marginBottom: 8 }}>
            <div style={cardTitleStyle}>{T("蓄力", "Charge")}</div>
            <div style={textStyle}>
              <div style={{ marginBottom: 8 }}>
                <span style={codeStyle}>[ ]</span>{" "}
                {T(
                  "表示蓄力：按住括号内指令",
                  "Means charge: hold the direction inside brackets."
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={codeStyle}>[4]6P</span>{" "}
                {T("= 后蓄力 > 前 + P", "= hold back > forward + P")}
              </div>
              <div>
                <span style={codeStyle}>[2]8K</span>{" "}
                {T("= 下蓄力 > 上 + K", "= hold down > up + K")}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", padding: "4px 2px" }}>
            {T("提示：点击弹窗外空白处或按 Esc 关闭。", "Tip: Click outside or press Esc to close.")}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}