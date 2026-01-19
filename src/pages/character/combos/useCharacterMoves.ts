import { useEffect, useMemo, useState } from "react";

type MoveRow = {
  id: string;
  nameCN?: string;
  nameEN?: string;
  input?: string;
  inputDisplay?: string;
  category?: string;
  hitType?: string;
};

type FrameDataJSON = {
  characterId: string;
  moves: MoveRow[];
};

// ✅ 用绝对路径，避免 glob key 拼不上的坑
const modules = import.meta.glob("/src/data/frameData/*.json");

export function useCharacterMoves(characterKey: string) {
  const [data, setData] = useState<FrameDataJSON | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!characterKey) {
        if (alive) setData(null);
        return;
      }

      const key = `/src/data/frameData/${characterKey}.json`;
      const loader = (modules as any)[key] as (() => Promise<any>) | undefined;

      if (!loader) {
        if (alive) setData(null);
        return;
      }

      const mod = await loader();
      const json = (mod?.default ?? mod) as FrameDataJSON;
      if (alive) setData(json);
    }

    run();
    return () => {
      alive = false;
    };
  }, [characterKey]);

  const moves = useMemo(() => data?.moves ?? [], [data]);
  return { moves, hasData: !!data };
}
