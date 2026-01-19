import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type AppShellProps = {
  title?: string;

  lang: string;
  toggleLang: () => void;

  backTo?: string;
  backLabel?: string;

  appTitle?: string;
  showAppTitle?: boolean;

  /** 页面级：数据来源（像签名一样，极弱展示） */
  dataSource?: ReactNode;

  children?: ReactNode;
};

export default function AppShell({
  title,
  lang,
  toggleLang,
  backTo,
  backLabel,
  appTitle,
  showAppTitle = false,
  dataSource,
  children,
}: AppShellProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const setSBW = () => {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--sbw", `${sbw}px`);
    };

    setSBW();
    window.addEventListener("resize", setSBW);
    return () => window.removeEventListener("resize", setSBW);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        background: "radial-gradient(circle at top, #1a1630, #07060c)",
        color: "#fff",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 14,
          position: "relative",
        }}
      >
        {showAppTitle ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1.2,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {appTitle}
          </div>
        ) : null}

        {backTo ? (
          <Link
            to={backTo}
            style={{
              textDecoration: "none",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {backLabel || "←"}
          </Link>
        ) : null}

        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={toggleLang}
            style={{
              height: 42,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
          padding: "0 18px 24px",
          boxSizing: "border-box",
        }}
      >
        {children}

        {/* 页面级数据来源（像论文页脚） */}
        {dataSource ? (
          <div
            style={{
              marginTop: 32,
              fontSize: 11,
              color: "rgba(255,255,255,0.38)",
              textAlign: "center",
              letterSpacing: 0.2,
            }}
          >
            {lang === "zh" ? "数据来源：" : "Data: "} {dataSource}
          </div>
        ) : null}
      </div>

      {/* 全站签名（你的，未删除） */}
      <div style={{ padding: "24px 0 12px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          © 2026 Twguri · SF6 Player Memo
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            width: 46,
            height: 46,
            borderRadius: "60%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 900,
            zIndex: 999,
            backdropFilter: "blur(6px)",

            display:"flex",
            alignItems:"center",
            justifyContent:"center"
          }}
        >
          <span style={{ transform: "translateX(-0.5px)" }}>↑</span>
        </button>
      ) : null}
    </div>
  );
}
