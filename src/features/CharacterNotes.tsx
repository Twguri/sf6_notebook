import { useEffect, useMemo, useRef, useState } from "react";

type CharacterNotesProps = {
  characterId: string;       // 用来区分不同角色的心得
  title?: string;            // 页面标题（可选）
};

export default function CharacterNotes({ characterId, title = "角色心得" }: CharacterNotesProps) {
  const storageKey = useMemo(() => `sf6app:character:notes:${characterId}`, [characterId]);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // 进入页面：读本地存储
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw !== null) setText(raw);

    const t = localStorage.getItem(`${storageKey}:savedAt`);
    if (t) setSavedAt(t);
  }, [storageKey]);

  // 自动保存（防抖）
  useEffect(() => {
    setStatus("saving");

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      localStorage.setItem(storageKey, text);
      const t = new Date().toLocaleString();
      localStorage.setItem(`${storageKey}:savedAt`, t);
      setSavedAt(t);
      setStatus("saved");
    }, 400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [text, storageKey]);

  const onClear = () => {
    setText("");
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}:savedAt`);
    setSavedAt(null);
    setStatus("idle");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-neutral-100">{title}</div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {status === "saving" ? "保存中…" : status === "saved" ? `已保存：${savedAt ?? ""}` : "未保存"}
            </div>
          </div>

          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm"
          >
            清空
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="写下你的对局体会、连段要点、克制思路、训练目标…"
            className="w-full min-h-[320px] rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 p-3 outline-none focus:border-neutral-600"
          />
          <div className="text-xs text-neutral-500 mt-2">
            自动保存到本机浏览器（localStorage），刷新/退出不会丢。
          </div>
        </div>
      </div>
    </div>
  );
}
