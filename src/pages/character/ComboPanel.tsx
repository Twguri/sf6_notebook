// src/pages/character/ComboPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { FighterTextarea, FighterTextareaFixed } from "../../components/MemoEditor";


import type { ComboGroup, ComboItem } from "./combos/types";
import { loadGroups, saveGroups } from "./combos/storage";

type Props = {
  lang: "zh" | "en";
  toggleLang: () => void;
};

type ViewState =
  | { view: "groups" }
  | { view: "group"; groupId: string };

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// 指令栏：强制“fighter字符集”（如果你后面要接“数字→箭头显示”，我们再换成 FighterTextarea）
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

  // ====== 数据 ======
  const [groups, setGroups] = useState<ComboGroup[]>([]);
  useEffect(() => {
    setGroups(loadGroups(characterKey));
  }, [characterKey]);

  function persist(next: ComboGroup[]) {
    setGroups(next);
    saveGroups(characterKey, next);
  }

  // ====== 导航（两层视图） ======
  const [nav, setNav] = useState<ViewState>({ view: "groups" });

  const currentGroup = useMemo(() => {
    if (nav.view !== "group") return null;
    return groups.find((g) => g.id === nav.groupId) ?? null;
  }, [nav, groups]);

  // ====== 新建连段组弹窗 ======
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

    setNav({ view: "group", groupId: g.id });

    // reset inner ui
    setIsAdding(false);
    setExpandedId(null);
    setEditDraft(null);
  }

  function onOpenGroup(groupId: string) {
    setNav({ view: "group", groupId });
    setIsAdding(false);
    setExpandedId(null);
    setEditDraft(null);
  }

  // ====== 添加连段（组详情页） ======
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
  }

  function onAddComboConfirm() {
    if (!currentGroup) return;

    const item: ComboItem = {
      id: uid("combo"),
      name: draft.name.trim(),
      command: draft.command.trim(),
      pressure: { zh: draft.pressureZh, en: draft.pressureEn },
      notes: { zh: draft.notesZh, en: draft.notesEn },
    };

    const now = Date.now();
    const nextGroups = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return {
        ...g,
        items: [item, ...g.items],
        updatedAt: now,
      };
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

  // ====== banner 展开/收起 + “失焦/收起保存” ======
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
          command: editDraft.command,
          pressure: { zh: editDraft.pressureZh, en: editDraft.pressureEn },
          notes: { zh: editDraft.notesZh, en: editDraft.notesEn },
        };
      });
      return { ...g, items: nextItems, updatedAt: now };
    });

    persist(nextGroups);
  }

  function toggleExpand(item: ComboItem) {
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

  // ====== 文案 ======
  const t = {
    combos: lang === "zh" ? "连段" : "Combos",
    newGroup: lang === "zh" ? "新建连段组" : "New Combo Group",
    addCombo: lang === "zh" ? "添加连段" : "Add Combo",
    confirm: lang === "zh" ? "确认" : "Confirm",
    cancel: lang === "zh" ? "取消" : "Cancel",
    back: lang === "zh" ? "返回" : "Back",
    emptyGroups: lang === "zh" ? "还没有连段组" : "No groups yet",
    emptyItems: lang === "zh" ? "还没有连段" : "No combos yet",
    unnamed: lang === "zh" ? "未命名连段" : "Unnamed Combo",
    name: lang === "zh" ? "名称" : "Name",
    command: lang === "zh" ? "指令" : "Command",
    pressure: lang === "zh" ? "后续压制" : "Follow-up Pressure",
    notes: lang === "zh" ? "注意事项" : "Notes",
    groupNamePH: lang === "zh" ? "输入连段组名字" : "Group name",
    namePH: lang === "zh" ? "例如：轻攻击确认" : "e.g. Light confirm",
    cmdPH: lang === "zh" ? "例如：2LK 2LP xx 214P" : "e.g. 2LK 2LP xx 214P",
    combosCount: lang === "zh" ? "连段数: " : "Combos: ",
    notFound: lang === "zh" ? "找不到这个连段组" : "Group not found",
    hintFighter:
      lang === "zh"
        ? "提示：Ctrl+Alt+F 切换输入模式（Fighter/Normal），Fighter 模式数字自动变箭头"
        : "Tip: Ctrl+Alt+F toggles Fighter/Normal. In Fighter, digits become arrows.",
  };

  const pageTitle =
    nav.view === "group" && currentGroup
      ? `${t.combos} · ${currentGroup.name}`
      : t.combos;

  // ====== 样式（贴合你 AppShell 的深色风格） ======
  const S = {
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
      overflow: "hidden" as const,
    },
    bannerBtn: {
      width: "100%",
      padding: "12px 14px",
      background: "transparent",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      textAlign: "left" as const,
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
    row: { display: "flex", gap: 10, marginTop: 12 },
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
    section: { display: "flex", flexDirection: "column" as const, gap: 10 },
    dividerTop: {
      borderTop: "1px solid rgba(255,255,255,0.10)",
      padding: "12px 14px",
    },
  };

  return (
    <AppShell
      lang={lang}
      toggleLang={toggleLang}
      title={pageTitle}
      backTo={`/c/${characterKey}`}
      backLabel="←"
      showAppTitle={false}
    >
      {/* 视图 A：组列表 */}
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
                <button
                  key={g.id}
                  style={{ ...S.primaryBtn, background: "rgba(0,0,0,0.18)" }}
                  onClick={() => onOpenGroup(g.id)}
                >
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{g.name}</div>
                  <div style={S.thinText}>{t.combosCount + g.items.length}</div>
                </button>
              ))}
            </div>
          )}

          {/* 弹窗：新建连段组 */}
          {createOpen ? (
            <div
              style={S.modalMask}
              onClick={() => {
                setCreateOpen(false);
                setNewGroupName("");
              }}
            >
              <div style={S.modal} onClick={(e) => e.stopPropagation()}>
                <div style={S.modalTitle}>{t.newGroup}</div>

                <textarea
                  style={{
                    ...S.input,
                    height: "auto",
                    padding: "10px 12px",
                    lineHeight: 1.35,
                    resize: "vertical",
                    minHeight: 44,
                  }}
                  rows={2}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t.groupNamePH}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (canCreateGroup) onCreateGroupConfirm();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setCreateOpen(false);
                      setNewGroupName("");
                    }
                  }}
                />

                <div style={S.row}>
                  <button
                    style={S.cancelBtn}
                    onClick={() => {
                      setCreateOpen(false);
                      setNewGroupName("");
                    }}
                  >
                    {t.cancel}
                  </button>

                  {/* 只这里禁用 */}
                  <button
                    style={S.confirmBtn(!canCreateGroup)}
                    disabled={!canCreateGroup}
                    onClick={onCreateGroupConfirm}
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 视图 B：组详情 */}
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
                    />

                    {/* 指令：强制 fighter 字符集（你后续想显示箭头可换成 FighterTextarea） */}
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


                    {/* 后续压制：复用你 MemoEditor 的 Ctrl+Alt+F Fighter/Normal 输入法 */}
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

                    {/* 注意事项：同上 */}
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

                    {/* 按你要求：这里不禁用 */}
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
                        <button style={S.bannerBtn} onClick={() => toggleExpand(item)}>
                          <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
                        </button>

                        {isOpen && editDraft && editDraft.id === item.id ? (
                          <div style={S.dividerTop}>
                            <div style={S.section}>
                              <TextAreaField
                                label={t.name}
                                value={editDraft.name}
                                onChange={(v) =>
                                  setEditDraft((d) => (d ? { ...d, name: v } : d))
                                }
                                onBlur={commitEditDraft}
                                rows={2}
                                inputStyle={S.input}
                                labelStyle={S.fieldLabel}
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
                                  value={
                                    lang === "zh"
                                      ? editDraft.pressureZh
                                      : editDraft.pressureEn
                                  }
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

function TextAreaField({
  label,
  value,
  onChange,
  onBlur,
  rows = 2,
  placeholder,
  textareaProps,
  inputStyle,
  labelStyle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  rows?: number;
  placeholder?: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <textarea
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
        {...textareaProps}
      />
    </div>
  );
}
