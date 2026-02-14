import React from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import MemoEditor from "../../components/MemoEditor";

type Props = {
  lang: string;
  t: (key: string) => string;
  toggleLang: () => void;
};

type TipSection = {
  sid: string;
  name: string;
  collapsed: boolean;
};

function normalizeId(id?: string) {
  return (id ?? "unknown").trim().toLowerCase();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const menuBtnStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const modalBtnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  cursor: "pointer",
};

export default function CharacterTips({ lang, t, toggleLang }: Props) {
  const { id } = useParams<{ id: string }>();
  const charId = React.useMemo(() => normalizeId(id), [id]);

  // meta: sections list
  const metaKey = React.useMemo(
    () => `sf6app:character:tips:sections:${charId}`,
    [charId]
  );

  // old single memo key for migration
  const oldSingleKey = React.useMemo(
    () => `character:tips:${id ?? "unknown"}`,
    [id]
  );

  // new main memo key
  const mainMemoKey = React.useMemo(
    () => `sf6app:memo:character:tips:${charId}:main`,
    [charId]
  );

  const [sections, setSections] = React.useState<TipSection[]>(() => {
    const initial: TipSection[] = [{ sid: "main", name: "Main", collapsed: true }];
    const saved = safeJsonParse<TipSection[]>(localStorage.getItem(metaKey), initial);
    if (!Array.isArray(saved) || saved.length === 0) return initial;
    // ensure main exists
    if (!saved.some((s) => s && s.sid === "main")) {
      return [{ sid: "main", name: "Main", collapsed: true }, ...saved.filter(Boolean)];
    }
    return saved.filter(Boolean);
  });
  React.useEffect(() => {
    setSections((prev) => prev.map((s) => ({ ...s, collapsed: true })));
  // 只想执行一次就好：eslint 可能提示依赖，忽略即可
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // persist meta
  React.useEffect(() => {
    try {
      localStorage.setItem(metaKey, JSON.stringify(sections));
    } catch {}
  }, [metaKey, sections]);

  // migrate old single memo -> main (only if main empty and old exists)
  React.useEffect(() => {
    try {
      const old = localStorage.getItem(oldSingleKey);
      if (!old) return;

      const main = localStorage.getItem(mainMemoKey);
      if (!main) {
        localStorage.setItem(mainMemoKey, old);
      }
      // 保留旧 key 作为备份；你如果想迁移后删掉，取消下一行注释
      // localStorage.removeItem(oldSingleKey);
    } catch {}
  }, [oldSingleKey, mainMemoKey]);

  // ---------- UI state ----------
  const [menuOpenSid, setMenuOpenSid] = React.useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  // Rename modal
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameSid, setRenameSid] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  // Delete modal
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteSid, setDeleteSid] = React.useState<string | null>(null);

  // close menu when clicking outside (IMPORTANT: use click, not pointerdown)
  React.useEffect(() => {
    const onClick = () => setMenuOpenSid(null);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // ---------- actions ----------
  const toggleCollapsed = (sid: string) => {
    setSections((prev) =>
      prev.map((s) => (s.sid === sid ? { ...s, collapsed: !s.collapsed } : s))
    );
  };

  const openAdd = () => {
    setNewName("");
    setAddOpen(true);
  };

  const createSection = () => {
    const name = newName.trim();
    if (!name) return;
    const sid = makeId();

    setSections((prev) => [...prev, { sid, name, collapsed: true }]);

    setAddOpen(false);
    setNewName("");
  };

  const openRename = (sid: string) => {
    const cur = sections.find((s) => s.sid === sid);
    setRenameSid(sid);
    setRenameValue(cur?.name ?? "");
    setRenameOpen(true);
  };

  const confirmRename = () => {
    if (!renameSid) return;
    const name = renameValue.trim();
    if (!name) return;

    setSections((prev) => prev.map((s) => (s.sid === renameSid ? { ...s, name } : s)));

    setRenameOpen(false);
    setRenameSid(null);
    setRenameValue("");
  };

  const openDelete = (sid: string) => {
    if (sections.length <= 1) return;
    setDeleteSid(sid);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteSid) return;

    try {
      if (deleteSid === "main") {
        localStorage.removeItem(mainMemoKey);
      } else {
        const memoKey = `sf6app:memo:character:tips:${charId}:${deleteSid}`;
        localStorage.removeItem(memoKey);
      }
    } catch {}

    setSections((prev) => prev.filter((s) => s.sid !== deleteSid));

    setDeleteOpen(false);
    setDeleteSid(null);
  };

  return (
    <AppShell
      title={t("tipsTitle")}
      lang={lang}
      toggleLang={toggleLang}
      backTo={`/c/${charId}`}
      backLabel={t("back")}
    >
      {/* sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((sec) => {
          const memoKey =
            sec.sid === "main"
              ? mainMemoKey
              : `sf6app:memo:character:tips:${charId}:${sec.sid}`;

          return (
            <div
              key={sec.sid}
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                overflow: "visible",
              }}
            >
              {/* header bar */}
              <div
                onClick={() => toggleCollapsed(sec.sid)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ opacity: 0.8 }}>{sec.collapsed ? "▸" : "▾"}</span>
                  <span style={{ fontWeight: 650 }}>{sec.name}</span>
                </div>

                {/* ... menu */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenSid((cur) => (cur === sec.sid ? null : sec.sid));
                  }}
                  style={{
                    position: "relative",
                    padding: "2px 8px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.15)",
                    cursor: "pointer",
                  }}
                >
                  …

                  {menuOpenSid === sec.sid && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        minWidth: 150,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(20,20,20,0.95)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                        overflow: "hidden",
                        zIndex: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenSid(null);
                          openRename(sec.sid);
                        }}
                        style={menuBtnStyle}
                      >
                        {lang === "zh" ? "重命名" : "Rename"}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenSid(null);
                          openDelete(sec.sid);
                        }}
                        disabled={sections.length <= 1}
                        style={{
                          ...menuBtnStyle,
                          opacity: sections.length <= 1 ? 0.5 : 1,
                        }}
                      >
                        {lang === "zh" ? "删除" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* body */}
              {!sec.collapsed && (
                <div style={{ padding: 12 }}>
                  <MemoEditor
                    storageKey={memoKey}
                    title="" // ✅ 内部不显示名字，只在外框显示
                    placeholder={t("tipsPlaceholder")}
                    hint={t("tipsHint")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* centered add button (under the last editor) */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={openAdd}
          aria-label="Add section"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            color: "inherit",
            cursor: "pointer",
            fontSize: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* add modal */}
      {addOpen && (
        <div
          onClick={() => setAddOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(20,20,20,0.95)",
              boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              {lang === "zh" ? "新建模块" : "New Section"}
            </div>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={lang === "zh" ? "请输入名称" : "Enter a name"}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createSection();
                if (e.key === "Escape") setAddOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                outline: "none",
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setAddOpen(false)} style={modalBtnStyle}>
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={createSection}
                disabled={!newName.trim()}
                style={{
                  ...modalBtnStyle,
                  opacity: newName.trim() ? 1 : 0.5,
                }}
              >
                {lang === "zh" ? "创建" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* rename modal */}
      {renameOpen && (
        <div
          onClick={() => setRenameOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(20,20,20,0.95)",
              boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              {lang === "zh" ? "重命名模块" : "Rename Section"}
            </div>

            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={lang === "zh" ? "请输入新名称" : "Enter a new name"}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") setRenameOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                outline: "none",
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setRenameOpen(false)} style={modalBtnStyle}>
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmRename}
                disabled={!renameValue.trim()}
                style={{
                  ...modalBtnStyle,
                  opacity: renameValue.trim() ? 1 : 0.5,
                }}
              >
                {lang === "zh" ? "确认" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      {deleteOpen && (
        <div
          onClick={() => setDeleteOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(20,20,20,0.95)",
              boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {lang === "zh" ? "删除模块" : "Delete Section"}
            </div>

            <div style={{ opacity: 0.85, marginBottom: 14, lineHeight: 1.5 }}>
              {lang === "zh"
                ? "确定要删除这个模块吗？该模块的内容也会被删除。"
                : "Are you sure you want to delete this section? Its memo content will also be removed."}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setDeleteOpen(false)} style={modalBtnStyle}>
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  ...modalBtnStyle,
                  border: "1px solid rgba(255,80,80,0.35)",
                  background: "rgba(255,80,80,0.12)",
                }}
              >
                {lang === "zh" ? "删除" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
