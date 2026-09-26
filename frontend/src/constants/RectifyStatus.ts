export const RectifyStatus = ["OPEN", "SUBMITTED", "CLOSED"] as const;
export type RectifyStatus = (typeof RectifyStatus)[number];
export const RectifyStatusText: Record<RectifyStatus, string> = {
  OPEN: "待整改",
  SUBMITTED: "待复验",
  CLOSED: "已关闭"
};
