import { mockData } from "./seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { DispatchableResult, HazardTicket, HazardTicketView } from "../types/HazardTicket";
import type { Role } from "../constants/roles";

/**
 * 离线降级工作流：后端不可用时在本地种子数据副本上跑同一套整改闭环，
 * 保证 `npm run dev` 单独启动前端时页面仍可演示。
 */
export const localDb = structuredClone(mockData) as unknown as {
  building: typeof mockData.building;
  staff: typeof mockData.staff;
  fireDevice: typeof mockData.fireDevice;
  inspectionTask: typeof mockData.inspectionTask;
  inspectionResult: typeof mockData.inspectionResult;
  hazardTicket: HazardTicket[];
};

const [TPL_DISPATCH, TPL_SUBMIT, TPL_CLOSE] = LOG_TEMPLATES.HazardTicket;

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

function fail(code: keyof typeof ERROR_MESSAGES): never {
  throw new Error(ERROR_MESSAGES[code] ?? code);
}

function toView(ticket: HazardTicket): HazardTicketView {
  const result = localDb.inspectionResult.find((r) => r.id === ticket.result_id);
  const device = localDb.fireDevice.find((d) => d.id === result?.device_id);
  const building = localDb.building.find((b) => b.id === device?.building_id);
  const owner = localDb.staff.find((s) => s.id === ticket.owner_id);
  return {
    ...ticket,
    owner_name: owner?.name ?? "",
    device_id: device?.id ?? 0,
    device_code: device?.device_code ?? "",
    device_type: device?.device_type ?? "",
    building_name: building?.name ?? "",
    floor: device?.floor ?? "",
    location_desc: device?.location_desc ?? "",
    item_code: result?.item_code ?? "",
    result_note: result?.note ?? "",
    overdue: ticket.rectify_status !== "CLOSED" && !!ticket.deadline && ticket.deadline < today()
  };
}

export function localListHazardTicket(): HazardTicketView[] {
  const views = localDb.hazardTicket.map(toView);
  const open = views
    .filter((v) => v.rectify_status !== "CLOSED")
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.deadline.localeCompare(b.deadline));
  const closed = views
    .filter((v) => v.rectify_status === "CLOSED")
    .sort((a, b) => b.closed_at.localeCompare(a.closed_at));
  return [...open, ...closed];
}

export function localListDispatchable(): DispatchableResult[] {
  return localDb.inspectionResult
    .filter((r) => r.result_status === "ABNORMAL")
    .filter((r) => !localDb.hazardTicket.some((t) => t.result_id === r.id && t.rectify_status !== "CLOSED"))
    .map((r) => {
      const device = localDb.fireDevice.find((d) => d.id === r.device_id);
      const building = localDb.building.find((b) => b.id === device?.building_id);
      return {
        result_id: r.id,
        device_id: device?.id ?? 0,
        device_code: device?.device_code ?? "",
        building_name: building?.name ?? "",
        floor: device?.floor ?? "",
        location_desc: device?.location_desc ?? "",
        item_code: r.item_code,
        note: r.note,
        measured_value: r.measured_value
      };
    });
}

export function localListDeviceTickets(deviceId: number): HazardTicketView[] {
  const resultIds = new Set(localDb.inspectionResult.filter((r) => r.device_id === deviceId).map((r) => r.id));
  return localDb.hazardTicket
    .filter((t) => resultIds.has(t.result_id))
    .map(toView)
    .sort((a, b) => b.id - a.id);
}

export function localDispatch(payload: { result_id: number; severity: string; owner_id: number; deadline: string }, actor: { name: string; role: Role }): HazardTicketView {
  const result = localDb.inspectionResult.find((r) => r.id === payload.result_id);
  if (!result) fail("RESULT_NOT_FOUND");
  if (result.result_status !== "ABNORMAL") fail("RESULT_NOT_ABNORMAL");
  if (localDb.hazardTicket.some((t) => t.result_id === result.id && t.rectify_status !== "CLOSED")) {
    fail("HAZARD_TICKET_DUPLICATE_OPEN");
  }
  const owner = localDb.staff.find((s) => s.id === payload.owner_id && s.role === "MAINTAINER");
  if (!owner) fail("OWNER_NOT_FOUND");
  if (!payload.severity || !payload.deadline) fail("VALIDATION_FAILED");
  const ticket: HazardTicket = {
    id: Math.max(0, ...localDb.hazardTicket.map((t) => t.id)) + 1,
    result_id: result.id,
    severity: payload.severity as HazardTicket["severity"],
    owner_id: owner.id,
    deadline: payload.deadline,
    rectify_status: "OPEN",
    rectify_note: "",
    closed_at: "",
    history: [
      { action: "DISPATCH", actor: actor.name, role: actor.role, at: now(), detail: `${TPL_DISPATCH}：指派给${owner.name}，截止 ${payload.deadline}` }
    ]
  };
  localDb.hazardTicket.push(ticket);
  const device = localDb.fireDevice.find((d) => d.id === result.device_id);
  if (device) device.status = "ABNORMAL";
  return toView(ticket);
}

export function localSubmit(ticketId: number, rectifyNote: string, actor: { name: string; role: Role }): HazardTicketView {
  const ticket = localDb.hazardTicket.find((t) => t.id === ticketId);
  if (!ticket) fail("HAZARD_TICKET_NOT_FOUND");
  if (ticket.rectify_status !== "OPEN") fail("HAZARD_TICKET_BAD_STATE");
  if (!rectifyNote.trim()) fail("VALIDATION_FAILED");
  ticket.rectify_status = "SUBMITTED";
  ticket.rectify_note = rectifyNote.trim();
  ticket.history.push({ action: "SUBMIT", actor: actor.name, role: actor.role, at: now(), detail: `${TPL_SUBMIT}：${ticket.rectify_note}` });
  return toView(ticket);
}

export function localClose(ticketId: number, actor: { name: string; role: Role }): HazardTicketView {
  const ticket = localDb.hazardTicket.find((t) => t.id === ticketId);
  if (!ticket) fail("HAZARD_TICKET_NOT_FOUND");
  if (ticket.rectify_status !== "SUBMITTED") fail("HAZARD_TICKET_BAD_STATE");
  ticket.rectify_status = "CLOSED";
  ticket.closed_at = now();
  ticket.history.push({ action: "CLOSE", actor: actor.name, role: actor.role, at: now(), detail: `${TPL_CLOSE}：复验通过` });
  const result = localDb.inspectionResult.find((r) => r.id === ticket.result_id);
  const stillOpen = localDb.hazardTicket.some((t) => {
    const r = localDb.inspectionResult.find((x) => x.id === t.result_id);
    return r?.device_id === result?.device_id && t.rectify_status !== "CLOSED";
  });
  const device = localDb.fireDevice.find((d) => d.id === result?.device_id);
  if (device && !stillOpen) device.status = "NORMAL";
  return toView(ticket);
}
