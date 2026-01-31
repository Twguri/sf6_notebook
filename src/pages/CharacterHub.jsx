import React from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell.tsx";
import LinkCard from "../components/LinkCard.jsx";

export default function CharacterHub({ lang, t, toggleLang }) {
  const { id } = useParams();

  return (
    <AppShell
      title={id?.toUpperCase()}
      lang={lang}
      toggleLang={toggleLang}
      backTo="/"
      backLabel={t("back")}
    >
      <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
        <LinkCard to={`/c/${id}/frames`} title={t("framesTitle")} subtitle={t("framesSub")} theme="dark" />
        <LinkCard to={`/c/${id}/combos`} title={t("combosTitle")} subtitle={t("combosSub")} theme="dark" />
        <LinkCard to={`/c/${id}/matchup`} title={t("matchupTitle")} subtitle={t("matchupsSub")} theme="dark" />
        <LinkCard to={`/c/${id}/tips`} title={t("tipsTitle")} subtitle={t("tipsSub")} theme="dark" />
        <LinkCard to={`/c/${id}/training`} title={t("trainingTitle")} subtitle={t("trainingSub")} theme="dark" />
      </div>
    </AppShell>
  );
}

