export const DeviceStatus = ["NORMAL", "ABNORMAL"] as const;
export type DeviceStatus = (typeof DeviceStatus)[number];
export const DeviceStatusText: Record<DeviceStatus, string> = {
  NORMAL: "正常",
  ABNORMAL: "异常"
};
