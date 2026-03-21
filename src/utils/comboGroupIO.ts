import type { ComboGroup, ComboItem } from "../pages/character/combos/types.ts";

export const COMBO_GROUP_FILE_KIND = "sf6.combo-group";
export const COMBO_GROUP_FILE_VERSION = 1;

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function safeNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function sanitizeFilePart(s: string) {
  return (s || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function cloneComboItem(item: ComboItem): ComboItem {
  return {
    ...item,
    id: uid("combo"),
    name: safeString(item.name),
    command: safeString(item.command),
    pressure: isPlainObject(item.pressure)
      ? {
          zh: safeString(item.pressure.zh),
          en: safeString(item.pressure.en),
        }
      : { zh: "", en: "" },
    notes: isPlainObject(item.notes)
      ? {
          zh: safeString(item.notes.zh),
          en: safeString(item.notes.en),
        }
      : { zh: "", en: "" },
  };
}

function isComboItemLike(v: unknown): v is ComboItem {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.command === "string"
  );
}

function normalizeImportedItem(v: unknown): ComboItem | null {
  if (!isPlainObject(v)) return null;

  const base: ComboItem = {
    id: uid("combo"),
    name: safeString(v.name),
    command: safeString(v.command),
    pressure: isPlainObject(v.pressure)
      ? {
          zh: safeString(v.pressure.zh),
          en: safeString(v.pressure.en),
        }
      : { zh: "", en: "" },
    notes: isPlainObject(v.notes)
      ? {
          zh: safeString(v.notes.zh),
          en: safeString(v.notes.en),
        }
      : { zh: "", en: "" },
  };

  return base;
}

function normalizeImportedGroup(v: unknown): ComboGroup | null {
  if (!isPlainObject(v)) return null;

  const now = Date.now();
  const rawItems = Array.isArray(v.items) ? v.items : [];
  const items = rawItems
    .map((x) => normalizeImportedItem(x))
    .filter((x): x is ComboItem => !!x);

  return {
    id: uid("group"),
    name: safeString(v.name).trim(),
    items,
    createdAt: safeNumber(v.createdAt, now),
    updatedAt: safeNumber(v.updatedAt, now),
  };
}

export type ExportedComboGroupFile = {
  kind: typeof COMBO_GROUP_FILE_KIND;
  version: typeof COMBO_GROUP_FILE_VERSION;
  exportedAt: number;
  sourceCharacter: string;
  group: ComboGroup;
};

export function buildComboGroupExportData(args: {
  characterKey: string;
  group: ComboGroup;
}): ExportedComboGroupFile {
  const { characterKey, group } = args;

  return {
    kind: COMBO_GROUP_FILE_KIND,
    version: COMBO_GROUP_FILE_VERSION,
    exportedAt: Date.now(),
    sourceCharacter: characterKey,
    group: {
      ...group,
      items: Array.isArray(group.items) ? group.items.map(cloneComboItem) : [],
    },
  };
}

export function buildComboGroupExportJson(args: {
  characterKey: string;
  group: ComboGroup;
}) {
  return JSON.stringify(buildComboGroupExportData(args), null, 2);
}

export function buildComboGroupExportFilename(args: {
  characterKey: string;
  groupName: string;
  exportedAt?: number;
}) {
  const ts = new Date(args.exportedAt ?? Date.now())
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, "-");

  const charPart = sanitizeFilePart(args.characterKey || "character");
  const groupPart = sanitizeFilePart(args.groupName || "combo-group") || "combo-group";

  return `sf6-combo-group-${charPart}-${groupPart}-${ts}.json`;
}

export function downloadComboGroupFile(args: {
  characterKey: string;
  group: ComboGroup;
}) {
  const json = buildComboGroupExportJson(args);
  const filename = buildComboGroupExportFilename({
    characterKey: args.characterKey,
    groupName: args.group.name,
  });

  const blob = new Blob([json], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type ParseComboGroupImportResult =
  | {
      ok: true;
      file: ExportedComboGroupFile;
    }
  | {
      ok: false;
      reason:
        | "invalid_json"
        | "invalid_shape"
        | "invalid_kind"
        | "invalid_version"
        | "invalid_group"
        | "character_mismatch";
      message: string;
      sourceCharacter?: string;
    };

export function parseComboGroupImportJson(args: {
  text: string;
  currentCharacterKey: string;
}): ParseComboGroupImportResult {
  const { text, currentCharacterKey } = args;

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      ok: false,
      reason: "invalid_json",
      message: "JSON parse failed.",
    };
  }

  if (!isPlainObject(raw)) {
    return {
      ok: false,
      reason: "invalid_shape",
      message: "Imported file is not an object.",
    };
  }

  if (raw.kind !== COMBO_GROUP_FILE_KIND) {
    return {
      ok: false,
      reason: "invalid_kind",
      message: "This is not a combo group export file.",
    };
  }

  if (raw.version !== COMBO_GROUP_FILE_VERSION) {
    return {
      ok: false,
      reason: "invalid_version",
      message: "Unsupported combo group file version.",
    };
  }

  const sourceCharacter = safeString(raw.sourceCharacter).trim();
  if (!sourceCharacter) {
    return {
      ok: false,
      reason: "invalid_shape",
      message: "Missing sourceCharacter.",
    };
  }

  if (sourceCharacter !== currentCharacterKey) {
    return {
      ok: false,
      reason: "character_mismatch",
      message: "This combo group belongs to a different character.",
      sourceCharacter,
    };
  }

  const normalizedGroup = normalizeImportedGroup(raw.group);
  if (!normalizedGroup || !normalizedGroup.name) {
    return {
      ok: false,
      reason: "invalid_group",
      message: "Invalid combo group data.",
    };
  }

  return {
    ok: true,
    file: {
      kind: COMBO_GROUP_FILE_KIND,
      version: COMBO_GROUP_FILE_VERSION,
      exportedAt: safeNumber(raw.exportedAt, Date.now()),
      sourceCharacter,
      group: normalizedGroup,
    },
  };
}

export function cloneImportedComboGroup(args: {
  importedGroup: ComboGroup;
  existingGroups?: ComboGroup[];
}) {
  const { importedGroup, existingGroups = [] } = args;
  const now = Date.now();

  let nextName = (importedGroup.name || "").trim() || "Imported Group";

  const existingNames = new Set(
    existingGroups.map((g) => (g.name || "").trim()).filter(Boolean)
  );

  if (existingNames.has(nextName)) {
    let i = 2;
    let candidate = `${nextName} (${i})`;
    while (existingNames.has(candidate)) {
      i += 1;
      candidate = `${nextName} (${i})`;
    }
    nextName = candidate;
  }

  return {
    ...importedGroup,
    id: uid("group"),
    name: nextName,
    items: Array.isArray(importedGroup.items)
      ? importedGroup.items.map((item) => cloneComboItem(item))
      : [],
    createdAt: now,
    updatedAt: now,
  } satisfies ComboGroup;
}

export async function readJsonFileAsText(file: File): Promise<string> {
  return await file.text();
}