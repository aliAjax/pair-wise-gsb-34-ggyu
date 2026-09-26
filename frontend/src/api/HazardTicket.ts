import { apiGet, apiPost } from "../utils/http";
import {
  localClose,
  localDispatch,
  localListDispatchable,
  localListHazardTicket,
  localSubmit
} from "../mocks/localWorkflow";
import { useSessionStore } from "../stores/SessionStore";
import { RoleText } from "../constants/roles";
import type { DispatchableResult, HazardTicketView } from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

const actor = () => {
  const role = useSessionStore.getState().role;
  return { name: RoleText[role], role };
};

export async function listHazardTicket(): Promise<HazardTicketView[]> {
  try {
    return await apiGet<HazardTicketView[]>(endpoint);
  } catch {
    // 离线降级：本地种子数据上跑同一套流程
    return localListHazardTicket();
  }
}

export async function listDispatchableResults(): Promise<DispatchableResult[]> {
  try {
    return await apiGet<DispatchableResult[]>(`${endpoint}/dispatchable`);
  } catch {
    return localListDispatchable();
  }
}

export async function dispatchHazardTicket(payload: {
  result_id: number;
  severity: string;
  owner_id: number;
  deadline: string;
}): Promise<HazardTicketView> {
  try {
    return await apiPost<HazardTicketView>(`${endpoint}/dispatch`, payload);
  } catch (error) {
    if (error instanceof TypeError) return localDispatch(payload, actor());
    throw error;
  }
}

export async function submitHazardTicket(ticketId: number, rectifyNote: string): Promise<HazardTicketView> {
  try {
    return await apiPost<HazardTicketView>(`${endpoint}/${ticketId}/submit`, { rectify_note: rectifyNote });
  } catch (error) {
    if (error instanceof TypeError) return localSubmit(ticketId, rectifyNote, actor());
    throw error;
  }
}

export async function closeHazardTicket(ticketId: number): Promise<HazardTicketView> {
  try {
    return await apiPost<HazardTicketView>(`${endpoint}/${ticketId}/close`);
  } catch (error) {
    if (error instanceof TypeError) return localClose(ticketId, actor());
    throw error;
  }
}
