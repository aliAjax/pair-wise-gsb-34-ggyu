const textMap: Record<string, string> = {
  PENDING: "待派单",
  ASSIGNED: "待整改",
  RECTIFYING: "整改中",
  REVIEW_PENDING: "待复验",
  CLOSED: "已关闭",
  NORMAL: "正常",
  HAZARD_OPEN: "隐患未关闭",
  LOCAL_DATA: "本地数据",
  READY: "就绪"
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{textMap[value] ?? value}</span>;
}
