import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import MemoEditor from "../../components/MemoEditor";

type Props = {
  lang: string;
  t: (key: string) => string;
  toggleLang: () => void;
};

export default function CharacterTips({ lang, t, toggleLang }: Props) {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell
      title={t("tipsTitle")}
      lang={lang}
      toggleLang={toggleLang}
      backTo={`/c/${id}`}
      backLabel={t("back")}
    >
      <MemoEditor
        storageKey={`character:tips:${id ?? "unknown"}`}
        title={t("tipsTitle")}
        placeholder={t("tipsPlaceholder")}
        hint={t("tipsHint")}
      />
    </AppShell>
  );
}

