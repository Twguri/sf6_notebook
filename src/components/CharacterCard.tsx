export default function CharacterCard({
  character,
  title,
  subtitle,
  onClick,
}: {
  character: any;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        height: 150,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <img
        src={character.img}
        alt={character.nameEN}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: "scale(1.02)",
          filter: "contrast(1.05) saturate(1.05)",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 12,
          right: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
        <div style={{ opacity: 0.85, fontSize: 12, letterSpacing: 0.6 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
