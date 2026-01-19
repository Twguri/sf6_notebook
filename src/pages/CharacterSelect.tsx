import React from "react";
import { Link } from "react-router-dom";
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
          p: "游戏内自测 + 官方信息 + ComboMasher 数据整合。部分数据可能会随版本更新出现滞后，目前仍在持续录入与校对中。",
        },
        {
          h: "角色对策中怎么换对手？",
          p: "进入 Matchup 页面后，点击顶部 VS 横幅即可打开对手选择弹窗。",
        },
        {
          h: "连段功能怎么用？",
          p: "你可以创建/编辑/删除你的连段与连段组。进入 Combo 后先新建连段组（例如：确反连、板边连、绿冲连……），再在组内添加连段。连段默认包含：名称、指令、后续压制、注意事项。指令栏固定为格斗键盘输入；后续压制/注意事项可用 Ctrl+Alt+F 切换输入模式。指令输入支持键盘输入，也可以通过右上角“招式选择器”搜索并插入招式。",
        },
        {
          h: "关于更新",
          p: "当前版本 1.1.0：更新了帧数表（部分）以及连段输入（招式选择器）。帧数表仍在持续完善中。",
        },
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
          p: "Compiled from in-game testing, official information, and ComboMasher data. Some values may lag behind after game updates; the database is still being actively filled and verified.",
        },
        {
          h: "How do I change the opponent in Matchup?",
          p: "On the Matchup page, click the VS banner at the top to open the opponent picker.",
        },
        {
          h: "How do I use Combos?",
          p: "You can create/edit/delete combos and combo groups. Go to Combo → create a combo group (e.g., punishes, corner, Drive Rush, etc.) → add combos inside. Each combo includes: name, command, oki/follow-ups, and notes. The Command field is fixed to Fighter Input; the follow-up/notes fields can toggle input mode via Ctrl+Alt+F. You can type commands directly or insert moves via the move picker (search and select).",
        },
        {
          h: "Updates",
          p: "Current version: 1.1.0. Added partial frame data and improved combo input with a move picker. The frame data section is still being expanded and verified.",
        },
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
          overflow: "hidden",
        }}
      >
        {/* header */}
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

        {/* body */}
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
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

export default function CharacterSelect({ lang, t, toggleLang }: Props) {
  const [q, setQ] = React.useState("");

  const filtered = CHARACTERS.filter((c) => {
    const s = (c.nameCN + " " + c.nameEN + " " + c.id).toLowerCase();
    return s.includes(q.trim().toLowerCase());
  });

  const appTitle = lang === "zh" ? "街霸6玩家备忘录" : "SF6 Player Notebook";

  // ✅ Help 弹窗
  const [helpOpen, setHelpOpen] = React.useState(false);

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
      const data = JSON.parse(text);        // ✅ 关键：先 parse
      const count = importLogbook(data);    // ✅ 再导入对象

      setLogMsg(
        lang === "zh"
          ? `导入完成：载入 ${count} 条记录（已覆盖本地旧数据）。`
          : `Import complete: loaded ${count} entries (overwrote local data).`
      );

      // 让 Tips / Matchup / Combo 立即读取新数据
      window.location.reload();
    } catch (e) {
      console.error(e);
      setLogMsg(
        lang === "zh"
          ? "导入失败：文件格式不正确。"
          : "Import failed: invalid file."
      );
    } finally {
      // ✅ 允许再次选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

        {/* 顶部操作区：导出 / 导入 / Help */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
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
              e.currentTarget.value = ""; // 允许重复选择同一文件
              if (!f) return;
              onPickImportFile(f);
            }}
          />

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

        {logMsg ? (
          <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>{logMsg}</div>
        ) : null}

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
              <CharacterCard
                character={c}
                title={lang === "zh" ? c.nameCN : c.nameEN}
                subtitle={lang === "zh" ? c.nameEN : c.nameCN}
              />
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ opacity: 0.7, padding: "18px 6px" }}>{t("noMatch")}</div>
        )}
      </div>

      {/* Help 弹窗（你文件里已有 HelpModal 定义即可） */}
      <HelpModal open={helpOpen} lang={lang} onClose={() => setHelpOpen(false)} />
    </AppShell>
  );
}

