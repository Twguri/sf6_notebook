import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { FighterTextarea, FighterTextareaFixed } from "../../components/MemoEditor";

import type { ComboGroup, ComboItem } from "./combos/types";
import { loadGroups, saveGroups } from "./combos/storage";
import MovePickerModal from "./combos/MovePickerModal";
import { useCharacterMoves } from "./combos/useCharacterMoves";

type Props = {
  lang: "zh" | "en";
  toggleLang: () => void;
};

type MenuAnchor = { left: number; top: number; right: number; bottom: number };
type MenuState = null | { kind: "item"; id: string; anchor: MenuAnchor };

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeCommand(s: string) {
  // 只清理控制字符（保留箭头等 Unicode）
  return s
    .replace(/[\u0000-\u001F\u007F]/g, "") // 控制字符
    .replace(/\s+/g, " ")                  // 压缩空白
    .trim();
}

function normalizeButtons(s: string) {
  return s
    .replace(/\b(lp|mp|hp|lk|mk|hk)\b/gi, (m) => m.toUpperCase())
    .replace(/\b(pp|kk)\b/gi, (m) => m.toUpperCase())
    .replace(/\b(p|k)\b/gi, (m) => m.toUpperCase());
}
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


const MENU_W = 160;
const MENU_H = 96;
const MENU_MARGIN = 8;

function getMenuPos(anchor: MenuAnchor) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = anchor.bottom + MENU_MARGIN;
  if (top + MENU_H > vh - MENU_MARGIN) {
    top = Math.max(MENU_MARGIN, anchor.top - MENU_H - MENU_MARGIN);
  }

  let left = anchor.right - MENU_W;
  left = Math.min(left, vw - MENU_W - MENU_MARGIN);
  left = Math.max(MENU_MARGIN, left);

  return { left, top };
}

export default function ComboGroupPage({ lang, toggleLang }: Props) {
  const { id, groupId } = useParams<{ id: string; groupId: string }>();
  const characterKey = id ?? "unknown";
  const gid = groupId ?? "";
  const nav = useNavigate();

  // moves for picker
  const { moves: characterMoves } = useCharacterMoves(characterKey);
  const [pickOpen, setPickOpen] = useState(false);

  // storage
  const [groups, setGroups] = useState<ComboGroup[]>([]);
  useEffect(() => {
    setGroups(loadGroups(characterKey));
  }, [characterKey]);

  function persist(next: ComboGroup[]) {
    setGroups(next);
    saveGroups(characterKey, next);
  }

  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === gid) ?? null;
  }, [groups, gid]);

  // strings
  const t = useMemo(() => {
    return {
      combos: lang === "zh" ? "连段" : "Combos",
      addCombo: lang === "zh" ? "添加连段" : "Add Combo",
      confirm: lang === "zh" ? "确认" : "Confirm",
      back: lang === "zh" ? "返回" : "Back",
      rename: lang === "zh" ? "重命名" : "Rename",
      del: lang === "zh" ? "删除" : "Delete",
      emptyItems: lang === "zh" ? "还没有连段" : "No combos yet",
      notFound: lang === "zh" ? "找不到这个连段组" : "Group not found",
      unnamed: lang === "zh" ? "未命名连段" : "Unnamed Combo",
      name: lang === "zh" ? "名称" : "Name",
      command: lang === "zh" ? "指令" : "Command",
      pressure: lang === "zh" ? "后续压制" : "Follow-up Pressure",
      notes: lang === "zh" ? "注意事项" : "Notes",
      namePH: lang === "zh" ? "例如：轻攻击确认" : "e.g. Light confirm",
      cmdPH: lang === "zh" ? "例如：2LK 2LP xx 214P" : "e.g. 2LK 2LP xx 214P",
      hintFighter:
        lang === "zh"
          ? "提示：Ctrl+Alt+F 切换输入模式（Fighter/Normal），Fighter 模式数字自动变箭头"
          : "Tip: Ctrl+Alt+F toggles Fighter/Normal. In Fighter, digits become arrows.",
      pick: lang === "zh" ? "选招式" : "Pick",
    };
  }, [lang]);

  const pageTitle =
    currentGroup ? `${t.combos} · ${currentGroup.name}` : t.combos;

  // styles（沿用你当前风格）
  const S = {
    section: { display: "flex", flexDirection: "column" as const, gap: 10 },
    primaryBtn: {
      width: "100%",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 14,
      padding: "12px 14px",
      color: "#fff",
      cursor: "pointer",
      textAlign: "left" as const,
      fontWeight: 900,
      letterSpacing: 0.2,
    },
    card: {
      width: "100%",
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 16,
      overflow: "visible" as const,
      position: "relative" as const,
    },
    rowLine: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
    } as React.CSSProperties,
    bannerBtn: {
      flex: 1,
      padding: "10px 2px",
      background: "transparent",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      textAlign: "left" as const,
    },
    dotsBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.92)",
      cursor: "pointer",
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
    overlay: {
      position: "fixed" as const,
      inset: 0,
      background: "transparent",
      zIndex: 40,
    },
    menuBox: {
      position: "fixed" as const,
      width: 160,
      background: "rgba(10,10,14,0.98)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 14,
      overflow: "hidden" as const,
      zIndex: 9999,
      boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    } as React.CSSProperties,
    menuItem: {
      width: "100%",
      padding: "12px 12px",
      background: "transparent",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      textAlign: "left" as const,
      fontWeight: 900,
    } as React.CSSProperties,
    menuDivider: { borderTop: "1px solid rgba(255,255,255,0.10)" },

    dividerTop: {
      borderTop: "1px solid rgba(255,255,255,0.10)",
      padding: "12px 14px",
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: 800,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 6,
    },
    input: {
      width: "100%",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      outline: "none",
      fontWeight: 700,
    } as React.CSSProperties,
    thinText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.65)",
      marginTop: 6,
      fontWeight: 700,
    },
    pickBtn: {
      height: 30,
      padding: "0 10px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      fontSize: 12,
    } as React.CSSProperties,
    labelRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    } as React.CSSProperties,
  };

  // menu
  const [menu, setMenu] = useState<MenuState>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  // add combo
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    command: "",
    pressureZh: "",
    pressureEn: "",
    notesZh: "",
    notesEn: "",
  });

  function onAddComboClick() {
    setIsAdding(true);
    setDraft({
      name: "",
      command: "",
      pressureZh: "",
      pressureEn: "",
      notesZh: "",
      notesEn: "",
    });
    setExpandedId(null);
    setEditDraft(null);
    setMenu(null);
  }

  function onAddComboConfirm() {
    if (!currentGroup) return;

    const item: ComboItem = {
      id: uid("combo"),
      name: draft.name.trim(),
      command: sanitizeCommand(draft.command.trim()),
      pressure: { zh: draft.pressureZh, en: draft.pressureEn },
      notes: { zh: draft.notesZh, en: draft.notesEn },
    };

    const now = Date.now();
    const next = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return { ...g, items: [item, ...g.items], updatedAt: now };
    });

    persist(next);

    setIsAdding(false);
    setDraft({
      name: "",
      command: "",
      pressureZh: "",
      pressureEn: "",
      notesZh: "",
      notesEn: "",
    });
    setExpandedId(null);
    setEditDraft(null);
  }

  // expand/edit + commit
  const [expandedId, setExpandedId] = useState<string | null>(null);

  type EditDraft =
    | {
        id: string;
        name: string;
        command: string;
        pressureZh: string;
        pressureEn: string;
        notesZh: string;
        notesEn: string;
      }
    | null;

  const [editDraft, setEditDraft] = useState<EditDraft>(null);

  function commitEditDraft() {
    if (!currentGroup || !editDraft) return;

    const now = Date.now();
    const next = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      const nextItems = g.items.map((it) => {
        if (it.id !== editDraft.id) return it;
        return {
          ...it,
          name: editDraft.name,
          command: sanitizeCommand(editDraft.command),
          pressure: { zh: editDraft.pressureZh, en: editDraft.pressureEn },
          notes: { zh: editDraft.notesZh, en: editDraft.notesEn },
        };
      });
      return { ...g, items: nextItems, updatedAt: now };
    });

    persist(next);
  }

  // 离开页面时自动提交（防止返回丢编辑）
  useEffect(() => {
    return () => {
      try {
        commitEditDraft();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId, editDraft, gid, characterKey]);

  function toggleExpand(item: ComboItem) {
    if (expandedId && expandedId !== item.id) commitEditDraft();

    if (expandedId === item.id) {
      commitEditDraft();
      setExpandedId(null);
      setEditDraft(null);
      return;
    }

    setExpandedId(item.id);
    setEditDraft({
      id: item.id,
      name: item.name,
      command: item.command,
      pressureZh: item.pressure?.zh ?? "",
      pressureEn: item.pressure?.en ?? "",
      notesZh: item.notes?.zh ?? "",
      notesEn: item.notes?.en ?? "",
    });
  }

  function deleteItem(itemId: string) {
    if (!currentGroup) return;
    setMenu(null);

    const now = Date.now();
    const next = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return { ...g, items: g.items.filter((it) => it.id !== itemId), updatedAt: now };
    });

    if (expandedId === itemId) {
      setExpandedId(null);
      setEditDraft(null);
    }

    persist(next);
  }

  // rename item: expand + clear name + autofocus
  const nameTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pendingNameFocusId, setPendingNameFocusId] = useState<string | null>(null);

  function startRenameItem(item: ComboItem) {
    setMenu(null);
    if (expandedId && expandedId !== item.id) commitEditDraft();

    setExpandedId(item.id);
    setEditDraft({
      id: item.id,
      name: "",
      command: item.command,
      pressureZh: item.pressure?.zh ?? "",
      pressureEn: item.pressure?.en ?? "",
      notesZh: item.notes?.zh ?? "",
      notesEn: item.notes?.en ?? "",
    });

    setPendingNameFocusId(item.id);
  }

  useEffect(() => {
    if (!pendingNameFocusId) return;
    if (expandedId !== pendingNameFocusId) return;

    const timer = window.setTimeout(() => {
      const el = nameTextareaRef.current;
      if (el) {
        el.focus();
        try {
          el.setSelectionRange(0, el.value.length);
        } catch {}
      }
      setPendingNameFocusId(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pendingNameFocusId, expandedId]);

  // ✅ 统一处理：从 Modal 选择招式后，把指令追加到“当前正在编辑的 command”
  function appendPickedInput(insRaw: string) {
    const ins = (insRaw ?? "").trim();
    if (!ins) return;

    // 优先：新增连段正在编辑
    if (isAdding) {
      setDraft((d) => {
        const sep = d.command.trim().length ? " " : "";
        return { ...d, command: `${d.command}${sep}${ins}` };
      });
      return;
    }

    // 其次：展开编辑某条连段
    setEditDraft((d) => {
      if (!d) return d;
      const sep = d.command.trim().length ? " " : "";
      return { ...d, command: `${d.command}${sep}${ins}` };
    });
  }

  if (!currentGroup) {
    return (
      <AppShell
        lang={lang}
        toggleLang={toggleLang}
        title={t.combos}
        backTo={`/c/${characterKey}/combos`}
        backLabel="←"
        showAppTitle={false}
      >
        <div style={{ padding: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
          {t.notFound}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      lang={lang}
      toggleLang={toggleLang}
      title={pageTitle}
      backTo={`/c/${characterKey}/combos`}
      backLabel="←"
      showAppTitle={false}
    >
      {menu ? <div style={S.overlay} onClick={() => setMenu(null)} /> : null}

      <div style={S.section}>
        {!isAdding ? (
          <button style={S.primaryBtn} onClick={onAddComboClick}>
            {t.addCombo}
          </button>
        ) : (
          <div style={{ ...S.card, padding: 14 }}>
            <div style={S.section}>
              <TextAreaField
                label={t.name}
                value={draft.name}
                onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                rows={2}
                placeholder={t.namePH}
                inputStyle={S.input}
                labelStyle={S.fieldLabel}
                autoFocus
              />

              <div>
                <div style={S.labelRow}>
                  <div style={S.fieldLabel}>{t.command}</div>

                  <button style={S.pickBtn} onClick={() => setPickOpen(true)}>
                    {t.pick}
                  </button>
                </div>

                <FighterTextareaFixed
                  value={draft.command}
                  onChange={(next) => setDraft((d) => ({ ...d, command: next }))}
                  placeholder={t.cmdPH}
                  minHeight={80}
                  style={S.input}
                />
              </div>

              <div>
                <div style={S.fieldLabel}>{t.pressure}</div>
                <FighterTextarea
                  value={lang === "zh" ? draft.pressureZh : draft.pressureEn}
                  onChange={(next) => {
                    if (lang === "zh") setDraft((d) => ({ ...d, pressureZh: next }));
                    else setDraft((d) => ({ ...d, pressureEn: next }));
                  }}
                  minHeight={120}
                  style={S.input}
                />
                <div style={S.thinText}>{t.hintFighter}</div>
              </div>

              <div>
                <div style={S.fieldLabel}>{t.notes}</div>
                <FighterTextarea
                  value={lang === "zh" ? draft.notesZh : draft.notesEn}
                  onChange={(next) => {
                    if (lang === "zh") setDraft((d) => ({ ...d, notesZh: next }));
                    else setDraft((d) => ({ ...d, notesEn: next }));
                  }}
                  minHeight={120}
                  style={S.input}
                />
              </div>

              <button
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.90)",
                  color: "#111",
                  fontWeight: 900,
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={onAddComboConfirm}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        )}

        {currentGroup.items.length === 0 ? (
          <div style={{ ...S.thinText, fontSize: 13 }}>{t.emptyItems}</div>
        ) : (
          <div style={S.section}>
            {currentGroup.items.map((item) => {
              const title = item.name?.trim() ? item.name.trim() : t.unnamed;
              const isOpen = expandedId === item.id;

              return (
                <div key={item.id} style={S.card}>
                  <div style={S.rowLine}>
                    <button style={S.bannerBtn} onClick={() => toggleExpand(item)}>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
                    </button>

                    <button
                      style={S.dotsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        setMenu((m) =>
                          m && m.kind === "item" && m.id === item.id
                            ? null
                            : {
                                kind: "item",
                                id: item.id,
                                anchor: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
                              }
                        );
                      }}
                      aria-label="menu"
                      title="menu"
                    >
                      ⋯
                    </button>
                  </div>

                  {menu && menu.kind === "item" && menu.id === item.id ? (
                    <div
                      style={{ ...S.menuBox, ...getMenuPos(menu.anchor) }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button style={S.menuItem} onClick={() => startRenameItem(item)}>
                        {t.rename}
                      </button>
                      <div style={S.menuDivider} />
                      <button style={S.menuItem} onClick={() => deleteItem(item.id)}>
                        {t.del}
                      </button>
                    </div>
                  ) : null}

                  {isOpen && editDraft && editDraft.id === item.id ? (
                    <div style={S.dividerTop}>
                      <div style={S.section}>
                        <TextAreaField
                          label={t.name}
                          value={editDraft.name}
                          onChange={(v) => setEditDraft((d) => (d ? { ...d, name: v } : d))}
                          onBlur={() => commitEditDraft()}
                          rows={2}
                          inputStyle={S.input}
                          labelStyle={S.fieldLabel}
                          textareaRef={(el) => {
                            nameTextareaRef.current = el;
                          }}
                        />

                        <div>
                          <div style={S.labelRow}>
                            <div style={S.fieldLabel}>{t.command}</div>
                            <button style={S.pickBtn} onClick={() => setPickOpen(true)}>
                              {t.pick}
                            </button>
                          </div>

                          <FighterTextareaFixed
                            value={editDraft.command}
                            onChange={(next) =>
                              setEditDraft((d) => (d ? { ...d, command: next } : d))
                            }
                            placeholder={t.cmdPH}
                            minHeight={80}
                            style={S.input}
                          />
                        </div>

                        <div>
                          <div style={S.fieldLabel}>{t.pressure}</div>
                          <FighterTextarea
                            value={lang === "zh" ? editDraft.pressureZh : editDraft.pressureEn}
                            onChange={(next) =>
                              setEditDraft((d) => {
                                if (!d) return d;
                                return lang === "zh"
                                  ? { ...d, pressureZh: next }
                                  : { ...d, pressureEn: next };
                              })
                            }
                            minHeight={120}
                            style={S.input}
                          />
                        </div>

                        <div>
                          <div style={S.fieldLabel}>{t.notes}</div>
                          <FighterTextarea
                            value={lang === "zh" ? editDraft.notesZh : editDraft.notesEn}
                            onChange={(next) =>
                              setEditDraft((d) => {
                                if (!d) return d;
                                return lang === "zh"
                                  ? { ...d, notesZh: next }
                                  : { ...d, notesEn: next };
                              })
                            }
                            minHeight={120}
                            style={S.input}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ 关键：Modal 必须渲染在 return 里，否则点按钮不会有任何反应 */}
      {pickOpen ? (
        <MovePickerModal
          lang={lang}
          toggleLang={toggleLang}
          moves={characterMoves}
          onClose={() => setPickOpen(false)}
          onPick={(m: any) => {
            const ins = (m?.inputDisplay ?? m?.input ?? "").trim();
            if (!ins) return;
            appendPickedInput(digitsToArrows(normalizeButtons(ins)));
            setPickOpen(false);
          }}
        />
      ) : null}
    </AppShell>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  onBlur,
  rows = 2,
  placeholder,
  inputStyle,
  labelStyle,
  textareaRef,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  rows?: number;
  placeholder?: string;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        style={{
          ...inputStyle,
          height: "auto",
          padding: "10px 12px",
          lineHeight: 1.35,
          resize: "vertical",
          minHeight: rows * 22 + 22,
          whiteSpace: "pre-wrap",
        }}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}
