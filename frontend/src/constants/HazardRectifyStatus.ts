export type HazardRectifyStatus = "PENDING" | "ASSIGNED" | "RECTIFYING" | "REVIEW_PENDING" | "CLOSED";

export const OPEN_HAZARD_STATUSES: HazardRectifyStatus[] = ["PENDING", "ASSIGNED", "RECTIFYING", "REVIEW_PENDING"];

export const HazardRectifyStatusText: Record<HazardRectifyStatus, string> = {
  PENDING: "待派单",
  ASSIGNED: "待整改",
  RECTIFYING: "整改中",
  REVIEW_PENDING: "待复验",
  CLOSED: "已关闭"
};
