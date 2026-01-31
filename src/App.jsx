import { Routes, Route, Link, useParams } from "react-router-dom";
import React from "react";

import CharacterSelect from "./pages/CharacterSelect.tsx";
import CharacterHub from "./pages/CharacterHub.jsx";
import Placeholder from "./pages/Placeholder.jsx";

import CharacterTips from "./pages/character/CharacterTips";
import Matchup from "./pages/character/Matchup";
import ComboPanel from "./pages/character/ComboPanel"; 
import { exportLogbook, importLogbook } from "./utils/logbook";
import ComboGroupsPage from "./pages/character/ComboGroupsPage";
import ComboGroupPage from "./pages/character/ComboGroupPage";
import { Navigate } from "react-router-dom";
import FrameDataCharacterPage from "./pages/FrameDataCharacterPage";
import TrainingPlan from "./pages/character/TrainingPlan";

const I18N = {
  zh: {
    selectCharacter: "选择角色",
    searchPlaceholder: "搜索角色 / 输入英文名",
    noMatch: "没有匹配的角色",
    back: "← 返回",

    framesTitle: "角色指令和帧数表",
    framesSub: "查询角色动作信息",
    combosTitle: "角色连段",
    combosSub: "记录实用连段和压制技巧",
    matchupsSub: "对战中的经验积累",
    tipsTitle: "角色TIPS",
    tipsSub: "关于角色的思考",
    blankHint: "空白页：下一步我们在这里加列表/新增/编辑。",
    matchupTitle:"全角色对策",
    trainingTitle:"训练计划",
    trainingSub:"添加与完成训练清单"
  },
  en: {
    selectCharacter: "Select Character",
    searchPlaceholder: "Search character / type name",
    noMatch: "No results",
    back: "← Back",

    framesTitle: "Command List & Frame Data",
    framesSub: "COMMAND LIST & FRAME DATA",
    combosTitle: "Character Combos",
    combosSub: "CHARACTER COMBO STRATEGIES",
    matchupsSub: "STRATEGIES AGAINST ALL CHARACTERS",
    tipsTitle: "Tips & Insights",
    tipsSub: "CHARACTER TIPS & INSIGHTS",
    matchupTitle:"Matchups",
    trainingTitle:"Training Plan",
    

    blankHint: "Placeholder: we will add list/create/edit here next.",
    trainingSub:"ADD & COMPLETE DRILLS"
  },
};




export default function App() {
  const [lang, setLang] = React.useState(() => localStorage.getItem("lang") || "zh");

  const t = React.useCallback(
    (key) => (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : key,
    [lang]
  );

  const toggleLang = React.useCallback(() => {
    setLang((prev) => {
      const next = prev === "zh" ? "en" : "zh";
      localStorage.setItem("lang", next);
      return next;
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<CharacterSelect lang={lang} t={t} toggleLang={toggleLang} />} />
      <Route path="/c/:id" element={<CharacterHub lang={lang} t={t} toggleLang={toggleLang} />} />
      <Route path="/c/:id/frames" element={<FrameDataCharacterPage lang={lang} t={t} toggleLang={toggleLang}/>}/>
      <Route path="/c/:id/combo" element={<Navigate to="../combos" replace />} />
      <Route path="/c/:id/matchup" element={<Matchup lang={lang} t={t} toggleLang={toggleLang} />} />
      <Route path="/c/:id/tips" element={<CharacterTips lang={lang} t={t} toggleLang={toggleLang} />}/>
      <Route path="/c/:id/combos" element={<ComboGroupsPage lang={lang} toggleLang={toggleLang} />} />
      <Route path="/c/:id/combos/:groupId" element={<ComboGroupPage lang={lang} toggleLang={toggleLang} />} />
      <Route path="/c/:id/training" element={<TrainingPlan lang={lang} t={t} toggleLang={toggleLang} />} />

    </Routes>
  );
}