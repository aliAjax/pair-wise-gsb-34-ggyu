export type DeviceRuntimeStatus = "NORMAL" | "HAZARD_OPEN";

export const DeviceRuntimeStatusText: Record<DeviceRuntimeStatus, string> = {
  NORMAL: "正常",
  HAZARD_OPEN: "隐患未关闭"
};
