import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { FighterTextarea, FighterTextareaFixed } from "../../components/MemoEditor";

import type { ComboGroup, ComboItem } from "./combos/types";
import { loadGroups, saveGroups } from "./combos/storage";

type Props = {
  lang: "zh" | "en";
  toggleLang: () => void;
};

type ViewState = { view: "groups" } | { view: "group"; groupId: string };
type MenuState = null | { kind: "group" | "item"; id: string };

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// 纯防呆：确保 command 不会塞进奇怪字符
function sanitizeCommand(s: string) {
  const ascii = s.replace(/[^\x20-\x7E]/g, "");
  return ascii.replace(
    /[^A-Za-z0-9 \t+\-*/().,:'"!?_=#@&%<>\[\]\\|^`~]/g,
    ""
  );
}

export default function ComboPanel({ lang, toggleLang }: Props) {
  const { id } = useParams<{ id: string }>();
  const characterKey = id ?? "unknown";

  // =========================
  // Storage
  // =========================
  const [groups, setGroups] = useState<ComboGroup[]>([]);
  useEffect(() => {
    setGroups(loadGroups(characterKey));
  }, [characterKey]);

  function persist(next: ComboGroup[]) {
    setGroups(next);
    saveGroups(characterKey, next);
  }

  // =========================
  // Navigation
  // =========================
  const [nav, setNav] = useState<ViewState>({ view: "groups" });

  const currentGroup = useMemo(() => {
    if (nav.view !== "group") return null;
    return groups.find((g) => g.id === nav.groupId) ?? null;
  }, [nav, groups]);

  // =========================
  // UI strings
  // =========================
  const t = {
    combos: lang === "zh" ? "连段" : "Combos",
    newGroup: lang === "zh" ? "新建连段组" : "New Combo Group",
    renameGroupTitle: lang === "zh" ? "重命名连段组" : "Rename Group",
    addCombo: lang === "zh" ? "添加连段" : "Add Combo",
    confirm: lang === "zh" ? "确认" : "Confirm",
    cancel: lang === "zh" ? "取消" : "Cancel",
    back: lang === "zh" ? "返回" : "Back",
    rename: lang === "zh" ? "重命名" : "Rename",
    del: lang === "zh" ? "删除" : "Delete",
    emptyGroups: lang === "zh" ? "还没有连段组" : "No groups yet",
    emptyItems: lang === "zh" ? "还没有连段" : "No combos yet",
    notFound: lang === "zh" ? "找不到这个连段组" : "Group not found",
    unnamed: lang === "zh" ? "未命名连段" : "Unnamed Combo",
    name: lang === "zh" ? "名称" : "Name",
    command: lang === "zh" ? "指令" : "Command",
    pressure: lang === "zh" ? "后续压制" : "Follow-up Pressure",
    notes: lang === "zh" ? "注意事项" : "Notes",
    groupNamePH: lang === "zh" ? "输入连段组名字" : "Group name",
    namePH: lang === "zh" ? "例如：轻攻击确认" : "e.g. Light confirm",
    cmdPH: lang === "zh" ? "例如：2LK 2LP xx 214P" : "e.g. 2LK 2LP xx 214P",
    combosCount: lang === "zh" ? "连段数: " : "Combos: ",
    hintFighter:
      lang === "zh"
        ? "提示：Ctrl+Alt+F 切换输入模式（Fighter/Normal），Fighter 模式数字自动变箭头"
        : "Tip: Ctrl+Alt+F toggles Fighter/Normal. In Fighter, digits become arrows.",
  };

  const pageTitle =
    nav.view === "group" && currentGroup
      ? `${t.combos} · ${currentGroup.name}`
      : t.combos;

  // =========================
  // Styles (保持简洁、稳)
  // =========================
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
    cardInner:{
      borderRadius: 16,
      overflow: "hidden" as const,
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
      position: "absolute" as const,
      top: 52,
      right: 12,
      width: 160,
      background: "rgba(10,10,14,0.98)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 14,
      overflow: "hidden" as const,
      zIndex: 50,
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
    modalMask: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      width: "92%",
      maxWidth: 520,
      background: "rgba(10,10,14,0.98)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 18,
      padding: 16,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 900,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    row: { display: "flex", gap: 10, marginTop: 12 },
    confirmBtn: (disabled: boolean): React.CSSProperties => ({
      flex: 1,
      height: 44,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.90)",
      color: disabled ? "rgba(0,0,0,0.45)" : "#111",
      fontWeight: 900,
      cursor: disabled ? "not-allowed" : "pointer",
    }),
    cancelBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
  };

  // =========================
  // Three-dot menu
  // =========================
  const [menu, setMenu] = useState<MenuState>(null);

  // =========================
  // Group: create / rename / delete
  // =========================
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const canCreateGroup = newGroupName.trim().length > 0;

  function onCreateGroupConfirm() {
    const name = newGroupName.trim();
    if (!name) return;

    const now = Date.now();
    const g: ComboGroup = {
      id: uid("group"),
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    const next = [g, ...groups];
    persist(next);

    setCreateOpen(false);
    setNewGroupName("");

    // 进入新建的组
    setNav({ view: "group", groupId: g.id });

    // reset combo ui
    setIsAdding(false);
    setExpandedId(null);
    setEditDraft(null);
  }

  function onOpenGroup(groupId: string) {
    setNav({ view: "group", groupId });
    setIsAdding(false);
    setExpandedId(null);
    setEditDraft(null);
    setMenu(null);
  }

  const [renameGroupOpen, setRenameGroupOpen] = useState(false);
  const [renameGroupId, setRenameGroupId] = useState<string | null>(null);
  const [renameGroupName, setRenameGroupName] = useState("");

  function openRenameGroup(groupId: string) {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    setMenu(null);
    setRenameGroupOpen(true);
    setRenameGroupId(groupId);
    setRenameGroupName(g.name ?? "");
  }

  const canRenameGroup = renameGroupName.trim().length > 0;

  function onRenameGroupConfirm() {
    if (!renameGroupId) return;
    const name = renameGroupName.trim();
    if (!name) return;

    const now = Date.now();
    const nextGroups = groups.map((g) =>
      g.id === renameGroupId ? { ...g, name, updatedAt: now } : g
    );
    persist(nextGroups);

    setRenameGroupOpen(false);
    setRenameGroupId(null);
    setRenameGroupName("");
  }

  function deleteGroup(groupId: string) {
    setMenu(null);
    const next = groups.filter((g) => g.id !== groupId);
    persist(next);

    if (nav.view === "group" && nav.groupId === groupId) {
      setNav({ view: "groups" });
      setIsAdding(false);
      setExpandedId(null);
      setEditDraft(null);
    }
  }

  // =========================
  // Group page: add combo
  // =========================
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
    const nextGroups = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return { ...g, items: [item, ...g.items], updatedAt: now };
    });

    persist(nextGroups);

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

  // =========================
  // Item: expand/edit + commit
  // =========================
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
    const nextGroups = groups.map((g) => {
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

    persist(nextGroups);
  }

  function toggleExpand(item: ComboItem) {
    // 切换到另一条之前先提交当前编辑，避免丢
    if (expandedId && expandedId !== item.id) {
      commitEditDraft();
    }

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

  // =========================
  // Item: delete
  // =========================
  function deleteItem(itemId: string) {
    if (!currentGroup) return;
    setMenu(null);

    const now = Date.now();
    const nextGroups = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return { ...g, items: g.items.filter((it) => it.id !== itemId), updatedAt: now };
    });

    if (expandedId === itemId) {
      setExpandedId(null);
      setEditDraft(null);
    }

    persist(nextGroups);
  }

  // =========================
  // Item: rename (expand + clear name + auto focus)
  // =========================
  const nameTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pendingNameFocusId, setPendingNameFocusId] = useState<string | null>(null);

  function startRenameItem(item: ComboItem) {
    setMenu(null);

    // 如果正在编辑别的，先提交
    if (expandedId && expandedId !== item.id) commitEditDraft();

    setExpandedId(item.id);
    setEditDraft({
      id: item.id,
      name: "", // 清空名称
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
      // 用完就清，避免后续重复触发
      setPendingNameFocusId(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pendingNameFocusId, expandedId]);

  // =========================
  // Render
  // =========================
  return (
    <AppShell
      lang={lang}
      toggleLang={toggleLang}
      title={pageTitle}
      backTo={`/c/${characterKey}`}
      backLabel="←"
      showAppTitle={false}
    >
      {/* 点空白关闭菜单 */}
      {menu ? <div style={S.overlay} onClick={() => setMenu(null)} /> : null}

      {/* =========================
          View A: Group list
         ========================= */}
      {nav.view === "groups" ? (
        <div style={S.section}>
          <button style={S.primaryBtn} onClick={() => setCreateOpen(true)}>
            {t.newGroup}
          </button>

          {groups.length === 0 ? (
            <div style={{ ...S.thinText, fontSize: 13 }}>{t.emptyGroups}</div>
          ) : (
            <div style={S.section}>
              {groups.map((g) => (
                <div key={g.id} style={S.card}>
                  <div style={S.rowLine}>
                    <button style={S.bannerBtn} onClick={() => onOpenGroup(g.id)}>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{g.name}</div>
                      <div style={S.thinText}>{t.combosCount + g.items.length}</div>
                    </button>

                    <button
                      style={S.dotsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenu((m) =>
                          m && m.kind === "group" && m.id === g.id ? null : { kind: "group", id: g.id }
                        );
                      }}
                      aria-label="menu"
                      title="menu"
                    >
                      ⋯
                    </button>
                  </div>

                  {menu && menu.kind === "group" && menu.id === g.id ? (
                    <div style={S.menuBox} onClick={(e) => e.stopPropagation()}>
                      <button style={S.menuItem} onClick={() => openRenameGroup(g.id)}>
                        {t.rename}
                      </button>
                      <div style={S.menuDivider} />
                      <button style={S.menuItem} onClick={() => deleteGroup(g.id)}>
                        {t.del}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Modal: create group */}
          {createOpen ? (
            <Modal
              title={t.newGroup}
              value={newGroupName}
              placeholder={t.groupNamePH}
              canConfirm={canCreateGroup}
              confirmText={t.confirm}
              cancelText={t.cancel}
              onChange={setNewGroupName}
              onConfirm={onCreateGroupConfirm}
              onCancel={() => {
                setCreateOpen(false);
                setNewGroupName("");
              }}
              styles={S}
            />
          ) : null}

          {/* Modal: rename group */}
          {renameGroupOpen ? (
            <Modal
              title={t.renameGroupTitle}
              value={renameGroupName}
              placeholder={t.groupNamePH}
              canConfirm={canRenameGroup}
              confirmText={t.confirm}
              cancelText={t.cancel}
              onChange={setRenameGroupName}
              onConfirm={onRenameGroupConfirm}
              onCancel={() => {
                setRenameGroupOpen(false);
                setRenameGroupId(null);
                setRenameGroupName("");
              }}
              styles={S}
            />
          ) : null}
        </div>
      ) : null}

      {/* =========================
          View B: Group detail
         ========================= */}
      {nav.view === "group" ? (
        <div style={S.section}>
          {!currentGroup ? (
            <div style={{ ...S.thinText, fontSize: 13 }}>{t.notFound}</div>
          ) : (
            <>
              <button
                style={S.primaryBtn}
                onClick={() => {
                  commitEditDraft();
                  setExpandedId(null);
                  setEditDraft(null);
                  setIsAdding(false);
                  setMenu(null);
                  setNav({ view: "groups" });
                }}
              >
                ← {t.back}
              </button>

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
                      <div style={S.fieldLabel}>{t.command}</div>
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
                        {/* collapsed header */}
                        <div style={S.rowLine}>
                          <button style={S.bannerBtn} onClick={() => toggleExpand(item)}>
                            <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
                          </button>

                          <button
                            style={S.dotsBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenu((m) =>
                                m && m.kind === "item" && m.id === item.id ? null : { kind: "item", id: item.id }
                              );
                            }}
                            aria-label="menu"
                            title="menu"
                          >
                            ⋯
                          </button>
                        </div>

                        {/* item menu */}
                        {menu && menu.kind === "item" && menu.id === item.id ? (
                          <div style={S.menuBox} onClick={(e) => e.stopPropagation()}>
                            <button style={S.menuItem} onClick={() => startRenameItem(item)}>
                              {t.rename}
                            </button>
                            <div style={S.menuDivider} />
                            <button style={S.menuItem} onClick={() => deleteItem(item.id)}>
                              {t.del}
                            </button>
                          </div>
                        ) : null}

                        {/* expanded editor */}
                        {isOpen && editDraft && editDraft.id === item.id ? (
                          <div style={S.dividerTop}>
                            <div style={S.section}>
                              <TextAreaField
                                label={t.name}
                                value={editDraft.name}
                                onChange={(v) =>
                                  setEditDraft((d) => (d ? { ...d, name: v } : d))
                                }
                                onBlur={() => commitEditDraft()}
                                rows={2}
                                inputStyle={S.input}
                                labelStyle={S.fieldLabel}
                                textareaRef={(el) => {
                                  nameTextareaRef.current = el;
                                }}
                              />

                              <div>
                                <div style={S.fieldLabel}>{t.command}</div>
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
            </>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}

// =========================
// Reusable components
// =========================

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

function Modal({
  title,
  value,
  placeholder,
  canConfirm,
  confirmText,
  cancelText,
  onChange,
  onConfirm,
  onCancel,
  styles,
}: {
  title: string;
  value: string;
  placeholder?: string;
  canConfirm: boolean;
  confirmText: string;
  cancelText: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  styles: any;
}) {
  return (
    <div style={styles.modalMask} onClick={onCancel}>
      <div style={styles.modal} onClick={(e: any) => e.stopPropagation()}>
        <div style={styles.modalTitle}>{title}</div>

        <textarea
          style={{
            ...styles.input,
            height: "auto",
            padding: "10px 12px",
            lineHeight: 1.35,
            resize: "vertical",
            minHeight: 44,
          }}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canConfirm) onConfirm();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
        />

        <div style={styles.row}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>

          <button
            style={styles.confirmBtn(!canConfirm)}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
