// src/features/frameData/frameDataStore.ts

export type MoveCategory = "normals" | "targetCombos" | "specials" | "supers";

export type MoveRow = {
  id: string;
  nameCN: string;
  nameEN: string;
  input?: string;
  category: MoveCategory;

  startup: string;
  active: string;
  recovery: string;
  onBlock: string;
  onHit: string;
  cancel: string;
  hitType: string;
};

export type CharacterFrameData = {
  characterId: string;
  displayNameCN: string;
  displayNameEN: string;
  lastUpdated?: string;
  moves: MoveRow[];
};

// ✅ Vite 自动扫描：新增 JSON 无需改代码
const MODULES = import.meta.glob("../../data/frameData/*.json", { eager: true });

// 兼容 JSON 导出有 default / 无 default 两种情况
function unwrap(mod: any) {
  return mod?.default ?? mod;
}

const MAP: Record<string, CharacterFrameData> = {};
for (const path in MODULES) {
  const key = path.split("/").pop()!.replace(".json", "");
  MAP[key] = unwrap((MODULES as any)[path]) as CharacterFrameData;
}

/** 取整份角色帧数数据（没有则返回 null） */
export function getFrameData(characterId: string): CharacterFrameData | null {
  return MAP[characterId] ?? null;
}

/** 只取招式数组（没有则返回空数组，便于 UI 直接用） */
export function getMovesForCharacter(characterId: string): MoveRow[] {
  return MAP[characterId]?.moves ?? [];
}

/** 是否有该角色的数据 */
export function hasFrameData(characterId: string): boolean {
  return !!MAP[characterId];
}

/** （可选）拿到目前已经收录的角色 id 列表 */
export function getAvailableFrameDataIds(): string[] {
  return Object.keys(MAP);
}
