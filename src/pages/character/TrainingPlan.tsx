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

const TRAINING_PREFIX = "character:training:"; // ✅ 与 logbook.ts 的 PREFIXES 对齐
const LEGACY_PREFIX = "sf6_training_plan_";    // ✅ 旧 key 前缀（用于迁移）

export default function TrainingPlan({ lang, t, toggleLang }: any) {
  const { id } = useParams();
  const charId = (id || "").toLowerCase();

  // ✅ 新 key（会被 logbook.ts 收集导出）
  const storageKey = React.useMemo(() => `${TRAINING_PREFIX}${charId}`, [charId]);
  // ✅ 旧 key（迁移用）
  const legacyKey = React.useMemo(() => `${LEGACY_PREFIX}${charId}`, [charId]);

  const [items, setItems] = React.useState<Item[]>(() => {
    try {
      // 1) 新 key 优先读取
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }

      // 2) 若新 key 没有，尝试迁移旧 key
      const oldRaw = localStorage.getItem(legacyKey);
      if (oldRaw) {
        const parsed = JSON.parse(oldRaw);
        const arr = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        localStorage.setItem(storageKey, JSON.stringify(arr));
        localStorage.removeItem(legacyKey);
        return arr;
      }

      return [];
    } catch {
      return [];
    }
  });

  // ✅ 持久化（写到新 key）
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const onAdd = () => {
    setItems((prev) => [...prev, { id: makeId(), text: "" }]);
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  };

  const onChangeText = (itemId: string, text: string) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, text } : it)));
  };

  // ✅ 勾选后 banner 消失（删除）
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
        <div style={{ opacity: 0.75, marginBottom: 10 }}>{t("trainingSub")}</div>

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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
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
