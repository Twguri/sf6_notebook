// src/features/combos/types.ts
export type Lang = "zh" | "en";

export type ComboItem = {
  id: string;
  name: string;          // 名称
  command: string;       // 指令
  pressure: { zh: string; en: string }; // 后续压制（可切换）
  notes: { zh: string; en: string };    // 注意事项（可切换）
};

export type ComboGroup = {
  id: string;
  name: string;          // 连段组名字
  items: ComboItem[];
  createdAt: number;
  updatedAt: number;
};

export type CombosByChar = Record<string, ComboGroup[]>;
