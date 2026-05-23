interface Props {
  source: string;
  date?: string;
}

export default function DataLabel({ source, date }: Props) {
  return (
    <small className="data" style={{ display: "block", marginTop: "0.4rem" }}>
      KÄLLA — {source}
      {date && ` · ${date}`}
    </small>
  );
}
