import React from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";

type Item = {
  id: string;
  text: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TrainingPlan({ lang, t, toggleLang }: any) {
  const { id } = useParams();
  const charId = (id || "").toLowerCase();

  const storageKey = React.useMemo(() => `sf6_training_plan_${charId}`, [charId]);

  const [items, setItems] = React.useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      return [];
    } catch {
      return [];
    }
  });

  // 持久化：每个角色一个清单
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const onAdd = () => {
    setItems((prev) => [...prev, { id: makeId(), text: "" }]);
    // 添加后把页面滚到底部（更像“按钮在下方”的体验）
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  };

  const onChangeText = (itemId: string, text: string) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, text } : it)));
  };

  // 勾选后 banner 消失（删除）
  const onDone = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  return (
    <AppShell
      title={t("trainingTitle")}
      lang={lang}
      toggleLang={toggleLang}
      backTo={`/c/${id}`}
      backLabel={t("back")}
    >
      <div style={{ marginTop: 12 }}>
        {/* 可选：小标题/说明 */}
        <div style={{ opacity: 0.75, marginBottom: 10 }}>
          {t("trainingSub")}
        </div>

        {/* banners */}
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <input
                value={it.text}
                onChange={(e) => onChangeText(it.id, e.target.value)}
                placeholder={lang === "zh" ? "输入训练内容…" : "Type a drill…"}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 14,
                  padding: "6px 4px",
                }}
              />

              {/* 右侧小勾选框：勾选就删除 */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                title={lang === "zh" ? "完成并移除" : "Complete & remove"}
              >
                <input
                  type="checkbox"
                  onChange={() => onDone(it.id)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
              </label>
            </div>
          ))}
        </div>

        {/* “+”按钮永远在最下面 */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            onClick={onAdd}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "inherit",
              fontSize: 22,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              lineHeight:1,
              cursor: "pointer",
            }}
            aria-label="add"
          >
            ＋
          </button>
        </div>
      </div>
    </AppShell>
  );
}
