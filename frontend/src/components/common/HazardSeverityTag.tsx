import { HazardSeverityText, type HazardSeverity } from "../../constants/HazardSeverity";

const severityClassName: Record<HazardSeverity, string> = {
  LOW: "severity-low",
  MEDIUM: "severity-medium",
  HIGH: "severity-high",
  CRITICAL: "severity-critical"
};

export function HazardSeverityTag({ value }: { value: HazardSeverity | string }) {
  const severity = value as HazardSeverity;
  return (
    <span className={`severity-tag ${severityClassName[severity] ?? "severity-medium"}`}>
      {HazardSeverityText[severity] ?? value}
    </span>
  );
}
