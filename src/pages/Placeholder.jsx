import React from "react";
import { Link } from "react-router-dom";

export default function Placeholder({ t, titleKey }) {
  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#fff", color: "#111" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#111", opacity: 0.8 }}>
        {t("back")}
      </Link>
      <h1 style={{ marginTop: 12 }}>{t(titleKey)}</h1>
      <p style={{ opacity: 0.7 }}>{t("blankHint")}</p>
    </div>
  );
}
