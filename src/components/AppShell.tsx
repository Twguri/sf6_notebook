import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";


type AppShellProps = {
  title?: string;

  lang: string;
  toggleLang: () => void;

  backTo?: string;
  backLabel?: string;

  appTitle?: string;
  showAppTitle?: boolean;

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
  children,
  
}: AppShellProps) {
  useEffect(() => {
    const setSBW = () => {
      const sbw = window.innerWidth - document.documentElement.clientWidth; // 滚动条宽度
      document.documentElement.style.setProperty("--sbw", `${sbw}px`);
    };

    setSBW();
    window.addEventListener("resize", setSBW);
    return () => window.removeEventListener("resize", setSBW);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        minWidth:"100%",
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
        {/* 应用标题（仅在需要时显示） */}
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

        {/* 返回按钮（可选） */}
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

        {/* 页面标题 */}
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

        {/* 语言切换 */}
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
              letterSpacing: 0.2,
            }}
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
        </div>
      </div>

      {/* Content container */}
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
      </div>
      <div style={{ padding: "24px 0 8px", textAlign: "center" }}>
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


    </div>
  );
}
