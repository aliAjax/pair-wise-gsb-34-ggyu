import { formatRisk } from "../../utils/formatters";

export function HazardSeverityTag({ value }: { value: string }) {
  return <span className={"severity-tag severity-" + String(value).toLowerCase()}>{formatRisk(value)}</span>;
}
