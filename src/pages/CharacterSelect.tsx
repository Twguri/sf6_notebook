import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CHARACTERS } from "../data/characters.js";
import AppShell from "../components/AppShell";
import CharacterCard from "../components/CharacterCard";
import { exportLogbook, importLogbook } from "../utils/logbook.js";

type Lang = "zh" | "en";

type Props = {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
};


function HelpModal({
  open,
  lang,
  onClose,
}: {
  open: boolean;
  lang: "zh" | "en";
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const title = lang === "zh" ? "帮助 / FAQ" : "Help / FAQ";

  const sections: Array<{ h: string; p: string }> =
    lang === "zh"
      ? [
          {
            h: "这是什么？",
            p: "这是一个为《街霸6》玩家开发的备忘录。你可以在这里记录对局思路、角色心得、小套路、连段使用等任何可能对实战有帮助的信息；也可以在这里查看不同角色的帧数表。",
          },
          {
            h: "快捷键 / 格斗键盘是什么？",
            p: "Ctrl+Alt+F（macOS：Cmd+Option+F）切换 正常 / 格斗键盘。有些文本输入区右上角也有 Normal/Fighter 切换按钮。格斗键盘模式下：数字 1–9 会按小键盘方向自动输入对应箭头；lp/mp/hp、lk/mk/hk、pp/kk/ppp/kkk 会在连段上下文中自动大写。连段记录中的“指令”输入默认为格斗键盘，绝大多数文本框支持切换。",
          },
          {
            h: "数据保存在哪里？",
            p: "内容保存在浏览器本地（localStorage）。不同角色、不同对手、不同连段组会分别保存。数据在没有操作的情况下会自动保存；你也可以手动导出 logbook 文件，方便异地使用以及防止误删。",
          },
          {
            h: "帧数表数据来源",
            p: "目前帧数表部分数据来自与卡普空官网的帧数数据，部分汉化翻译可能与原意有出入，关于备注部分的内容请以游戏内实际数据为准, 如果发现翻译问题或者数据错误请联系Twguri（bilibil， github）",
          },
          {
            h: "角色对策中怎么换对手？",
            p: "进入 Matchup 页面后，点击顶部 VS 横幅即可打开对手选择弹窗。",
          },
          {
            h: "连段功能怎么用？",
            p: "你可以创建/编辑/删除你的连段与连段组。进入 Combo 后先新建连段组（例如：确反连、板边连、绿冲连……），再在组内添加连段,点击加号就可以选择连段组件，点击已经添加的连段组件可以删除动作。连段默认包含：名称、指令、后续压制、注意事项。指令栏固定为格斗键盘输入；后续压制/注意事项可用 Ctrl+Alt+F 切换输入模式。",
          },
          {
            h: "关于更新",
            p: "当前版本 1.2.6：更新了帧数表（全角色）以及连段输入（招式选择器）和训练计划功能, 更新了Tips分区功能，更新了桌面端自检更新功能。帧数表仍在持续完善中。",
          },
          {
            h:"致谢",
            p:"感谢Vendémiaire，Paradox, Druid对汉化，校对，测试的支持！！！",
          }
        ]
      : [
          {
            h: "What is this?",
            p: "This is a notebook for Street Fighter 6 players. You can write down anything that helps your matches: matchup notes, character insights, small setups, combos, and more. It also includes frame data for each character.",
          },
          {
            h: "Hotkeys / Fighter Input",
            p: "Ctrl+Alt+F (macOS: Cmd+Option+F) toggles Normal vs Fighter Input. Some text fields also have a Normal/Fighter toggle button on the top-right. In Fighter Input: digits 1–9 map to directional arrows based on numpad directions; lp/mp/hp, lk/mk/hk, pp/kk/ppp/kkk auto-capitalize in combo context. The Combo “Command” field uses Fighter Input by default, and most text fields can switch modes.",
          },
          {
            h: "Where is my data saved?",
            p: "Everything is saved locally in your browser (localStorage). Notes are stored separately by character, opponent, and combo group. Your data auto-saves when you stop interacting, and you can also export a logbook file for backup or using it on another device.",
          },
          {
            h: "Frame Data sources",
            p: "Source of Frame data is from the Street Fighter 6 offical website. The actual data and notes part might have some mistakes, pleas refer to the actuall in-game data.",
          },
          {
            h: "How do I change the opponent in Matchup?",
            p: "On the Matchup page, click the VS banner at the top to open the opponent picker.",
          },
          {
            h: "How do I use Combos?",
            p: "You can create/edit/delete combos and combo groups. Go to Combo → create a combo group (e.g., punishes, corner, Drive Rush, etc.) → add combos inside，you can add move by click + button, clicking on existing movement allows you to change the move or remove it from the combo. Each combo includes: name, command, oki/follow-ups, and notes. The Command field is fixed to Fighter Input; the follow-up/notes fields can toggle input mode via Ctrl+Alt+F. ",
          },
          {
            h: "Updates",
            p: "Current version: 1.2.6. updated all characters' frame data and improved combo input with a move picker, updated the auto update function for desktop, and training plan section. Added the subsection function in Tips section. The frame data section is still being expanded and verified.",
          },
          {
              h:"Thanks",
              p:"Thanks for the helping from Vendémiaire，Paradox, Druid on translating, checking and testing!!!",
          }
        ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 3000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,14,0.98)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.55)",
          maxHeight: "calc(100dvh - 36px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            position:"sticky",
            zIndex: 2,
            top: 0,
            background:"rgba(10,10,14,0.98)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              height: 36,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            {lang === "zh" ? "关闭" : "Close"}
          </button>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 12, overflowY:"auto"}}>
          {sections.map((s, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{s.h}</div>
              <div style={{ opacity: 0.88, lineHeight: 1.6, fontSize: 13 }}>
                {s.p}
              </div>
            </div>
          ))}

          <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
            {lang === "zh"
              ? "提示：点击弹窗外空白处或按 Esc 关闭。"
              : "Tip: click outside the modal or press Esc to close."}
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesModal({
  open,
  lang,
  onClose,
  favorites,
  onPick,
}: {
  open: boolean;
  lang: Lang;
  onClose: () => void;
  favorites: Array<(typeof CHARACTERS)[number]>;
  onPick: (id: string) => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = lang === "zh" ? "常用角色" : "Favorites";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 3100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(860px, 100%)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,14,0.98)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.55)",
          overflow: "hidden",
          maxHeight: "calc(100dvh - 36px)",
          display:"flex",
          flexDirection:"column",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              height: 36,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            {lang === "zh" ? "关闭" : "Close"}
          </button>
        </div>

        <div style={{ padding: 16, overflowY:"auto" }}>
          {favorites.length === 0 ? (
            <div style={{ opacity: 0.8, lineHeight: 1.7, fontSize: 13 }}>
              {lang === "zh"
                ? "你还没有收藏角色。回到选择界面，点击角色 banner 右上角的 ⭐ 即可收藏。"
                : "No favorites yet. Go back and tap the ⭐ on the top-right of a character banner."}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {favorites.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onPick(c.id)}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <CharacterCard
                    character={c}
                    title={lang === "zh" ? c.nameCN : c.nameEN}
                    subtitle={lang === "zh" ? c.nameEN : c.nameCN}
                  />
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
            {lang === "zh"
              ? "提示：点击弹窗外空白处或按 Esc 关闭。"
              : "Tip: click outside the modal or press Esc to close."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CharacterSelect({ lang, t, toggleLang }: Props) {
  const navigate = useNavigate();

  const [q, setQ] = React.useState("");

  const filtered = CHARACTERS.filter((c) => {
    const s = (c.nameCN + " " + c.nameEN + " " + c.id).toLowerCase();
    return s.includes(q.trim().toLowerCase());
  });

  const appTitle = lang === "zh" ? "街霸6玩家备忘录" : "SF6 Player Notebook";
  const isDesktop = typeof (window as any).__TAURI__ !== "undefined";
  const DESKTOP_URL = "https://github.com/twguri/sf6_notebook/releases/latest";


  // ✅ Help 弹窗
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ✅ Favorites（常用角色）弹窗
  const [favOpen, setFavOpen] = React.useState(false);

  // ✅ 收藏：localStorage
  const FAV_KEY = "sf6:favorites:v1";
  const [favIds, setFavIds] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favIds));
    } catch {
      // ignore
    }
  }, [favIds]);

  const isFav = (id: string) => favIds.includes(id);

  const toggleFav = (id: string) => {
    setFavIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  const favoriteChars = React.useMemo(() => {
    const map = new Map(CHARACTERS.map((c) => [c.id, c]));
    return favIds.map((id) => map.get(id)).filter(Boolean) as Array<(typeof CHARACTERS)[number]>;
  }, [favIds]);

  // ✅ Logbook：导入/导出
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [logMsg, setLogMsg] = React.useState("");

  const onExportLogbook = () => {
    try {
      const data = exportLogbook();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `sf6-logbook-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLogMsg(lang === "zh" ? "已导出 Logbook。" : "Logbook exported.");
    } catch (e) {
      console.error(e);
      setLogMsg(lang === "zh" ? "导出失败。" : "Export failed.");
    }
  };

  const onPickImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const count = importLogbook(data);

      setLogMsg(
        lang === "zh"
          ? `导入完成：载入 ${count} 条记录（已覆盖本地旧数据）。`
          : `Import complete: loaded ${count} entries (overwrote local data).`
      );

      window.location.reload();
    } catch (e) {
      console.error(e);
      setLogMsg(lang === "zh" ? "导入失败：文件格式不正确。" : "Import failed: invalid file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AppShell
      title={t("selectCharacter")}
      lang={lang}
      toggleLang={toggleLang}
      appTitle={appTitle}
      showAppTitle={true}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 18px 24px" }}>
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: "12px 14px",
          }}
        >
          <span style={{ opacity: 0.8 }}>🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: 16,
            }}
          />
        </div>

        {/* 顶部操作区：导出 / 导入 / 常用角色 / Help */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {!isDesktop &&(
            <a
              href={DESKTOP_URL}
              target="_blank"
              rel="noreferrer"
              style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {lang === "zh" ? "下载桌面版（Windows）" : "Download Desktop (Windows)"}
            </a>
          )}

          <button
            type="button"
            onClick={onExportLogbook}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
            }}
          >
            {lang === "zh" ? "导出 Logbook" : "Export Logbook"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
            }}
          >
            {lang === "zh" ? "导入 Logbook" : "Import Logbook"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (!f) return;
              onPickImportFile(f);
            }}
          />

          {/* ✅ 常用角色 */}
          <button
            type="button"
            onClick={() => setFavOpen(true)}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ opacity: 0.95 }}>⭐</span>
            {lang === "zh" ? "常用角色" : "Favorites"}
            {favIds.length > 0 ? (
              <span
                style={{
                  marginLeft: 2,
                  fontSize: 12,
                  opacity: 0.85,
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                {favIds.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
            }}
          >
            {lang === "zh" ? "帮助 / FAQ" : "Help / FAQ"}
          </button>
        </div>

        {logMsg ? <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>{logMsg}</div> : null}

        {/* Grid */}
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {filtered.map((c) => (
            <Link key={c.id} to={`/c/${c.id}`} style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ position: "relative" }}>
                <CharacterCard
                  character={c}
                  title={lang === "zh" ? c.nameCN : c.nameEN}
                  subtitle={lang === "zh" ? c.nameEN : c.nameCN}
                />

                {/* ✅ 右上角收藏星标（点击不跳转） */}
                <button
                  type="button"
                  aria-label={isFav(c.id) ? "unfavorite" : "favorite"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFav(c.id);
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    border: "none",
                    background: "transparent",
                    backdropFilter: "none",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"center",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                  title={
                    lang === "zh"
                      ? isFav(c.id)
                        ? "取消收藏"
                        : "收藏"
                      : isFav(c.id)
                      ? "Unfavorite"
                      : "Favorite"
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: "translateY(-1px)", // 往下 1px；不够就改成 1.5px 或 2px
                    }}
                  >
                    {isFav(c.id) ? "⭐" : "☆"}
                  </span>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <div style={{ opacity: 0.7, padding: "18px 6px" }}>{t("noMatch")}</div>}
      </div>

      {/* Help 弹窗 */}
      <HelpModal open={helpOpen} lang={lang} onClose={() => setHelpOpen(false)} />

      {/* ✅ 常用角色弹窗 */}
      <FavoritesModal
        open={favOpen}
        lang={lang}
        favorites={favoriteChars}
        onClose={() => setFavOpen(false)}
        onPick={(id) => {
          setFavOpen(false);
          navigate(`/c/${id}`);
        }}
      />
    </AppShell>
  );
}
