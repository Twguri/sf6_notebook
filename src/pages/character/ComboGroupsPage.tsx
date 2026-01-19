import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";

import type { ComboGroup } from "./combos/types";
import { loadGroups, saveGroups } from "./combos/storage";

type Props = {
  lang: "zh" | "en";
  toggleLang: () => void;
};

type MenuAnchor = { left: number; top: number; right: number; bottom: number };
type MenuState = null | { kind: "group"; id: string; anchor: MenuAnchor };

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// menu 自动上/下展开
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

export default function ComboGroupsPage({ lang, toggleLang }: Props) {
  const { id } = useParams<{ id: string }>();
  const characterKey = id ?? "unknown";
  const nav = useNavigate();

  // storage
  const [groups, setGroups] = useState<ComboGroup[]>([]);
  useEffect(() => {
    setGroups(loadGroups(characterKey));
  }, [characterKey]);

  function persist(next: ComboGroup[]) {
    setGroups(next);
    saveGroups(characterKey, next);
  }

  // strings
  const t = useMemo(() => {
    return {
      title: lang === "zh" ? "连段" : "Combos",
      newGroup: lang === "zh" ? "新建连段组" : "New Combo Group",
      renameGroupTitle: lang === "zh" ? "重命名连段组" : "Rename Group",
      confirm: lang === "zh" ? "确认" : "Confirm",
      cancel: lang === "zh" ? "取消" : "Cancel",
      rename: lang === "zh" ? "重命名" : "Rename",
      del: lang === "zh" ? "删除" : "Delete",
      emptyGroups: lang === "zh" ? "还没有连段组" : "No groups yet",
      combosCount: lang === "zh" ? "连段数: " : "Combos: ",
      groupNamePH: lang === "zh" ? "输入连段组名字" : "Group name",
    };
  }, [lang]);

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
    input: {
      width: "100%",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      outline: "none",
      fontWeight: 700,
    } as React.CSSProperties,
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

  // create group modal
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

    nav(`/c/${characterKey}/combos/${g.id}`);
  }

  // rename group modal
  const [renameGroupOpen, setRenameGroupOpen] = useState(false);
  const [renameGroupId, setRenameGroupId] = useState<string | null>(null);
  const [renameGroupName, setRenameGroupName] = useState("");

  const canRenameGroup = renameGroupName.trim().length > 0;

  function openRenameGroup(groupId: string) {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    setMenu(null);
    setRenameGroupOpen(true);
    setRenameGroupId(groupId);
    setRenameGroupName(g.name ?? "");
  }

  function onRenameGroupConfirm() {
    if (!renameGroupId) return;
    const name = renameGroupName.trim();
    if (!name) return;

    const now = Date.now();
    const next = groups.map((g) =>
      g.id === renameGroupId ? { ...g, name, updatedAt: now } : g
    );
    persist(next);

    setRenameGroupOpen(false);
    setRenameGroupId(null);
    setRenameGroupName("");
  }

  function deleteGroup(groupId: string) {
    setMenu(null);
    persist(groups.filter((g) => g.id !== groupId));
  }

  return (
    <AppShell
      lang={lang}
      toggleLang={toggleLang}
      title={t.title}
      backTo={`/c/${characterKey}`}
      backLabel="←"
      showAppTitle={false}
    >
      {menu ? <div style={S.overlay} onClick={() => setMenu(null)} /> : null}

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
                  <button
                    style={S.bannerBtn}
                    onClick={() => nav(`/c/${characterKey}/combos/${g.id}`)}
                  >
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{g.name}</div>
                    <div style={S.thinText}>{t.combosCount + g.items.length}</div>
                  </button>

                  <button
                    style={S.dotsBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      setMenu((m) =>
                        m && m.kind === "group" && m.id === g.id
                          ? null
                          : {
                              kind: "group",
                              id: g.id,
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

                {menu && menu.kind === "group" && menu.id === g.id ? (
                  <div
                    style={{ ...S.menuBox, ...getMenuPos(menu.anchor) }}
                    onClick={(e) => e.stopPropagation()}
                  >
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

        {/* Create modal */}
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

        {/* Rename modal */}
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
    </AppShell>
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
