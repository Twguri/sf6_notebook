// src/features/combos/storage.ts
import type { CombosByChar, ComboGroup } from "./types";

const STORAGE_KEY = "sf6app.combos.v1";

function safeParse(json: string | null): CombosByChar {
  if (!json) return {};
  try {
    const data = JSON.parse(json);
    if (data && typeof data === "object") return data as CombosByChar;
    return {};
  } catch {
    return {};
  }
}

export function loadGroups(characterKey: string): ComboGroup[] {
  const all = safeParse(localStorage.getItem(STORAGE_KEY));
  return all[characterKey] ?? [];
}

export function saveGroups(characterKey: string, groups: ComboGroup[]) {
  const all = safeParse(localStorage.getItem(STORAGE_KEY));
  all[characterKey] = groups;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
