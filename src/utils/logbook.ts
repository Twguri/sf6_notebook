// ===== Logbook v1 =====

const COMBO_KEY = "sf6app.combos.v1";

// 所有需要被导入 / 导出的 key 前缀
const PREFIXES = [
  "matchup:",
  "character:tips:",
  "sf6app:character:tips:",
  "sf6app:memo:character:tips:",
] as const;

export type LogbookData = {
  version: 1;
  timestamp: number;
  entries: Record<string, string>;
};

// =========================
// 导出
// =========================
export function exportLogbook(): LogbookData {
  const entries: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // combos 是固定 key
    if (key === COMBO_KEY) {
      const v = localStorage.getItem(key);
      if (v != null) entries[key] = v;
      continue;
    }

    // 其余用前缀判断
    if (PREFIXES.some((p) => key.startsWith(p))) {
      const v = localStorage.getItem(key);
      if (v != null) entries[key] = v;
    }
  }

  return {
    version: 1,
    timestamp: Date.now(),
    entries,
  };
}

// =========================
// 导入（覆盖）
// =========================
export function importLogbook(data: LogbookData) {
  if (data.version !== 1) {
    throw new Error("Unsupported logbook version");
  }

  // 1️⃣ 先清空旧数据
  const toRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (
      key === COMBO_KEY ||
      PREFIXES.some((p) => key.startsWith(p))
    ) {
      toRemove.push(key);
    }
  }

  toRemove.forEach((k) => localStorage.removeItem(k));

  // 2️⃣ 写入新数据
  Object.entries(data.entries).forEach(([k, v]) => {
    localStorage.setItem(k, v);
  });
}
