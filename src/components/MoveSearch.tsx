import React from "react";
import type { MoveRow } from "../features/frameData/frameDataStore";
import { useMoveSearch, type MoveCategoryKey } from "../hooks/useMoveSearch";

export default function MoveSearch({
  moves,
  lang,
  onSelect,
  t,
  defaultCategory = "all",
  maxResults = 50,
  placeholder,
}: {
  moves: MoveRow[];
  lang: "zh" | "en";
  onSelect?: (move: MoveRow) => void;
  t?: (key: string) => string;
  defaultCategory?: MoveCategoryKey | "all";
  maxResults?: number;
  placeholder?: string;
}) {
  const { query, setQuery, category, setCategory, results } = useMoveSearch(
    moves,
    lang,
    { defaultCategory, maxResults }
  );

  const label = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
        padding: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            placeholder ??
            label("搜索招式 / 指令（如 236、lp、波动）", "Search moves / input (e.g. 236, lp, hadoken)")
          }
          style={{
            flex: "1 1 320px",
            height: 38,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 12px",
            outline: "none",
            fontSize: 14,
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          style={{
            height: 38,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 10px",
            outline: "none",
            fontSize: 14,
          }}
        >
          <option value="all">{label("全部", "All")}</option>
          <option value="normals">{label("普通拳脚", "Normals")}</option>
          <option value="targetCombos">{label("TC", "Target Combos")}</option>
          <option value="specials">{label("必杀技", "Specials")}</option>
          <option value="supers">{label("超必杀", "Supers")}</option>
        </select>

        <div style={{ opacity: 0.75, fontSize: 13 }}>
          {label("结果", "Results")}: {results.length}
        </div>
      </div>

      {results.length > 0 && (
        <div
          style={{
            marginTop: 10,
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect?.(m)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                cursor: onSelect ? "pointer" : "default",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 750 }}>
                  {lang === "zh" ? m.nameCN : m.nameEN}
                </div>
                <div style={{ opacity: 0.8, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>
                  {m.input ?? "-"}
                </div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {m.category}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
