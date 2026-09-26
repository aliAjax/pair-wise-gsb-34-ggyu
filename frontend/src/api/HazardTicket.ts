import { mockData } from "../mocks/seedData";
import type {
  DispatchHazardTicketPayload,
  HazardTicket,
  RectifyHazardTicketPayload
} from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

async function parseError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);
  throw new Error(body?.detail?.message ?? "整改单操作失败");
}

export async function listHazardTicket(): Promise<HazardTicket[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
    return parseError(res);
  } catch {
    return [...(mockData.hazardTicket as unknown as HazardTicket[])];
  }
}

export async function dispatchHazardTicket(ticketId: number, payload: DispatchHazardTicketPayload): Promise<HazardTicket> {
  const res = await fetch(`${endpoint}/${ticketId}/dispatch`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function submitHazardTicketReview(ticketId: number, payload: RectifyHazardTicketPayload): Promise<HazardTicket> {
  const res = await fetch(`${endpoint}/${ticketId}/submit-review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function closeHazardTicket(ticketId: number): Promise<HazardTicket> {
  const res = await fetch(`${endpoint}/${ticketId}/close`, { method: "PATCH" });
  if (!res.ok) return parseError(res);
  return res.json();
}
