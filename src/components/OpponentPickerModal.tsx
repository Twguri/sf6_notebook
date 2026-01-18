import React from "react";
import CharacterCard from "./CharacterCard";

export default function OpponentPickerModal({
  open,
  lang,
  characters,
  selectedId,
  onClose,
  onPick,
}: {
  open: boolean;
  lang: "zh" | "en";
  characters: any[];
  selectedId: string;
  onClose: () => void;         // X / 遮罩关闭：不改
  onPick: (id: string) => void; // 点角色：选中（外层会关）
}) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      {/* 遮罩：点了就关，不改 */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.62)",
        }}
      />

      {/* 面板 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(920px, 92vw)",
          maxHeight: "86vh",
          overflow: "auto",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(18,18,18,0.96)",
          padding: 14,
        }}
        onClick={(e) => e.stopPropagation()} // 防止点面板触发遮罩关闭
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
            padding: "2px 2px 8px",
          }}
        >
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>
            {lang === "zh" ? "选择对手角色" : "Choose Opponent"}
          </div>

          <button
            onClick={onClose}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Grid（缩小版） */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", // 桌面 4 列
            gap: 12,
          }}
        >
          {characters.map((c) => {
            const title = lang === "zh" ? c.nameCN : c.nameEN;
            const subtitle = lang === "zh" ? c.nameEN : c.nameCN;
            const active = c.id === selectedId;

            return (
              <div key={c.id} style={{ position: "relative" }}>
                {/* 选中描边（可选） */}
                <div
                  style={{
                    borderRadius: 16,
                    outline: active ? "2px solid rgba(255,255,255,0.65)" : "none",
                    outlineOffset: active ? 2 : 0,
                  }}
                >
                  <CharacterCard
                    character={c}
                    title={title}
                    subtitle={subtitle}
                    onClick={() => onPick(c.id)}
                    // 如果你愿意升级 CharacterCard：加 compact 控制高度
                    // compact
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
