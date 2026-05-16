interface DataLabelProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function DataLabel({ label, value, unit }: DataLabelProps) {
  return (
    <dl>
      <dt>{label}</dt>
      <dd>
        {value}
        {unit && <span> {unit}</span>}
      </dd>
    </dl>
  );
}
