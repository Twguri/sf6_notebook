import { useMemo, useState } from "react";
import type { MoveRow } from "../features/frameData/frameDataStore";

export type MoveCategoryKey = "normals" | "targetCombos" | "specials" | "supers";

export function useMoveSearch(
  moves: MoveRow[],
  lang: "zh" | "en",
  opts?: {
    defaultCategory?: MoveCategoryKey | "all";
    maxResults?: number;
  }
) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MoveCategoryKey | "all">(
    opts?.defaultCategory ?? "all"
  );

  const maxResults = opts?.maxResults ?? 50;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = moves;

    if (category !== "all") {
      list = list.filter((m) => m.category === category);
    }

    if (!q) return list.slice(0, maxResults);

    const tokens = q.split(/\s+/).filter(Boolean);

    const score = (m: MoveRow) => {
      const name = (lang === "zh" ? m.nameCN : m.nameEN) || "";
      const name2 = (lang === "zh" ? m.nameEN : m.nameCN) || "";
      const input = (m.input || "").toLowerCase();
      const hitType = (m.hitType || "").toLowerCase();

      const hay = `${name} ${name2} ${input} ${hitType}`.toLowerCase();

      // AND match: all tokens must appear somewhere
      for (const t of tokens) {
        if (!hay.includes(t)) return -1;
      }

      // simple ranking: prefer matches in name, then input
      let s = 0;
      for (const t of tokens) {
        if (name.toLowerCase().includes(t)) s += 5;
        if (name2.toLowerCase().includes(t)) s += 3;
        if (input.includes(t)) s += 4;
        if (hitType.includes(t)) s += 1;
      }
      // small preference: shorter names
      s += Math.max(0, 2 - Math.min(2, Math.floor(name.length / 20)));
      return s;
    };

    const scored = list
      .map((m) => ({ m, s: score(m) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, maxResults)
      .map((x) => x.m);

    return scored;
  }, [moves, lang, query, category, maxResults]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
  };
}
