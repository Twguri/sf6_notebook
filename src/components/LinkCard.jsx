import { Link } from "react-router-dom";

export default function LinkCard({
  to,
  title,
  subtitle,
  theme = "light",
}) {
  const isDark = theme === "dark";

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: isDark ? "#f2f2f2" : "#111",
        borderRadius: 16,
        padding: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: isDark
          ? "rgba(255,255,255,0.06)"
          : "linear-gradient(90deg, #eaf0ff, #f7f7ff)",

        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid #e5e5e5",

        backdropFilter: isDark ? "blur(6px)" : "none",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 0.4,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 14,
            opacity: isDark ? 0.7 : 0.6,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          fontSize: 26,
          opacity: isDark ? 0.6 : 0.5,
        }}
      >
        →
      </div>
    </Link>
  );
}
