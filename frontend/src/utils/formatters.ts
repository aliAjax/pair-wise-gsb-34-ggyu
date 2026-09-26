import { RectifyStatusText } from "../constants/RectifyStatus";
import { DeviceStatusText } from "../constants/DeviceStatus";
import { ResultStatusText } from "../constants/ResultStatus";
import type { RectifyStatus } from "../constants/RectifyStatus";

export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatDay = (value: string) => value || "—";
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatRectifyStatus = (value: string) => RectifyStatusText[value as RectifyStatus] ?? value;
export const formatDeviceStatus = (value: string) => DeviceStatusText[value as keyof typeof DeviceStatusText] ?? value;
export const formatResultStatus = (value: string) => ResultStatusText[value as keyof typeof ResultStatusText] ?? value;
/** 未关闭且截止日期早于今天即为逾期，逾期单在列表中排在最前。 */
export const isOverdue = (deadline: string, status: string) =>
  status !== "CLOSED" && !!deadline && deadline < new Date().toISOString().slice(0, 10);
