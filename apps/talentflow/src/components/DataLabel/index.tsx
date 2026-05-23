interface Props {
  source: string;
  date?: string;
}

export default function DataLabel({ source, date }: Props) {
  return (
    <small
      style={{ display: "block", color: "#666", fontSize: "0.75rem", marginTop: "0.25rem" }}
    >
      Källa: {source}
      {date && ` (${date})`}
    </small>
  );
}
