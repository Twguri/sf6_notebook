import React from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import MemoEditor from "../../components/MemoEditor";
import OpponentPickerModal from "../../components/OpponentPickerModal";
import { CHARACTERS } from "../../data/characters.js";

type Lang = "zh" | "en";

type Props = {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
};

const DEFAULT_OPP_ID = "luke";

function getChar(id?: string) {
  if (!id) return undefined;
  return CHARACTERS.find((c) => c.id === id);
}

export default function Matchup({ lang, t, toggleLang }: Props) {
  const { id } = useParams<{ id: string }>();
  const myChar = getChar(id);

  const [oppId, setOppId] = React.useState<string>(DEFAULT_OPP_ID);
  const [oppOpen, setOppOpen] = React.useState(false);

  const oppChar = getChar(oppId);

  // 如果对手不存在（未来数据变动），回到默认
  React.useEffect(() => {
    if (!oppChar) setOppId(DEFAULT_OPP_ID);
  }, [oppChar]);

  const safeOpp = oppChar ?? getChar(DEFAULT_OPP_ID);

  const titleText = t("matchupTitle") || (lang === "zh" ? "对策" : "Matchup");

  // 兜底：myChar 不存在
  if (!myChar) {
    return (
      <AppShell
        title={titleText}
        lang={lang}
        toggleLang={toggleLang}
        backTo={`/c/${id ?? ""}`}
        backLabel={t("back")}
      >
        <div style={{ opacity: 0.85 }}>
          {lang === "zh"
            ? "角色不存在或路由参数错误。请从角色列表重新进入。"
            : "Character not found or bad route param. Please re-enter from the character list."}
        </div>
      </AppShell>
    );
  }

  // safeOpp 理论上必存在（DEFAULT_OPP_ID 一定存在），这里再保险一下
  const opp = safeOpp || myChar;

  // 每个 (my, opp) 单独存
  const storageKey = `matchup:${myChar.id}:vs:${opp.id}`;

  return (
    <AppShell
      title={titleText}
      lang={lang}
      toggleLang={toggleLang}
      backTo={`/c/${myChar.id}`}
      backLabel={t("back")}
    >
      <div>
        {/* VS Banner：CharacterSelect 风格（双图拼接 + 渐变遮罩） */}
        <button
          onClick={() => setOppOpen(true)}
          style={{
            width: "100%",
            height: 150,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            padding: 0,
            cursor: "pointer",
            color: "#fff",
            position: "relative",
          }}
        >
          {/* 左右背景图（拼接） */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {/* 左：我的角色 */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={myChar.img}
                alt={myChar.nameEN}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: "scale(1.04)",
                  filter: "contrast(1.05) saturate(1.05)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.12) 70%, rgba(0,0,0,0.00))",
                }}
              />
            </div>

            {/* 右：对手 */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={opp.img}
                alt={opp.nameEN}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: "scale(1.04)",
                  filter: "contrast(1.05) saturate(1.05)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(270deg, rgba(0,0,0,0.78), rgba(0,0,0,0.12) 70%, rgba(0,0,0,0.00))",
                }}
              />
            </div>
          </div>

          {/* 中间融合遮罩：让 VS 区域更稳 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.10), rgba(0,0,0,0.22) 48%, rgba(0,0,0,0.22) 52%, rgba(0,0,0,0.10))",
              pointerEvents: "none",
            }}
          />

          {/* 文案层 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "end",
              padding: "0 14px 12px",
              gap: 12,
            }}
          >
            {/* 左文案 */}
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {lang === "zh" ? myChar.nameCN : myChar.nameEN}
              </div>
              <div style={{ opacity: 0.85, fontSize: 12, letterSpacing: 0.6 }}>
                {lang === "zh" ? myChar.nameEN : myChar.nameCN}
              </div>
            </div>

            {/* VS */}
            <div style={{ textAlign: "center", paddingBottom: 6 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.28)",
                  backdropFilter: "blur(6px)",
                }}
              >
                VS
              </div>
              <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
                {lang === "zh" ? "点击切换对手" : "Click to change"}
              </div>
            </div>

            {/* 右文案 */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {lang === "zh" ? opp.nameCN : opp.nameEN}
              </div>
              <div style={{ opacity: 0.85, fontSize: 12, letterSpacing: 0.6 }}>
                {lang === "zh" ? opp.nameEN : opp.nameCN}
              </div>
            </div>
          </div>
        </button>

        {/* Memo（每个对手一份，切换对手自动切换内容） */}
        <div style={{ marginTop: 14 }}>
          <MemoEditor
            key={storageKey} // ✅ 关键：storageKey 变则重挂载，加载对应备忘录
            storageKey={storageKey}
            title={
              lang === "zh"
                ? `对策备忘录：${myChar.nameCN} vs ${opp.nameCN}`
                : `Matchup Notes: ${myChar.nameEN} vs ${opp.nameEN}`
            }
            placeholder={
              t("matchupPlaceholder") ||
              (lang === "zh" ? "在这里记录你的对策…" : "Write your matchup notes here...")
            }
            hint={
              t("matchupHint") ||
              (lang === "zh"
                ? "建议：关键招式、惩罚点、对空、起身、个人提醒"
                : "Suggestions: key moves, punish, anti-air, okizeme, reminders")
            }
          />
        </div>
      </div>

      {/* 对手选择弹窗（两列，你已调好） */}
      <OpponentPickerModal
        open={oppOpen}
        lang={lang}
        characters={CHARACTERS}
        selectedId={oppId}
        onClose={() => setOppOpen(false)}
        onPick={(pickedId: string) => {
          setOppId(pickedId);
          setOppOpen(false);
        }}
      />
    </AppShell>
  );
}
