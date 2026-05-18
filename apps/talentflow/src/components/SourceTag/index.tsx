interface Props {
  source: string;
  fetchedAt?: string;
  href?: string;
}

function formatDatum(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function SourceTag({ source, fetchedAt, href }: Props) {
  const datum = formatDatum(fetchedAt);
  const text = datum ? `${source} · ${datum}` : source;
  return (
    <p className="source-note">
      Källa:{" "}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  );
}
