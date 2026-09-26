import type { HazardTicket } from "../types/HazardTicket";

export const createDefaultHazardTicket = (overrides: Partial<HazardTicket> = {}): HazardTicket => ({
  id: 0,
  result_id: 0,
  severity: "MEDIUM",
  owner_id: 0,
  deadline: "",
  rectify_status: "OPEN",
  rectify_note: "",
  closed_at: "",
  history: [],
  ...overrides
});

/** 派单表单：异常项 + 责任人 + 严重程度 + 截止日期 */
export const createHazardTicketDispatchForm = () => ({
  result_id: 0,
  severity: "MEDIUM",
  owner_id: 0,
  deadline: ""
});

/** 提交复验表单：处理说明 */
export const createHazardTicketSubmitForm = () => ({ rectify_note: "" });

export const createHazardTicketResponse = createDefaultHazardTicket;
