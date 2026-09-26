import type { HazardSeverity } from "../constants/HazardSeverity";
import type { HazardRectifyStatus } from "../constants/HazardRectifyStatus";
import type { HazardProcessEvent } from "./HazardProcessEvent";

export interface HazardTicket {
  id: number;
  result_id: number;
  severity: HazardSeverity;
  owner_id: number;
  deadline: string;
  rectify_status: HazardRectifyStatus;
  rectify_note: string;
  closed_at: string;
  process_events: HazardProcessEvent[];
}

export type DispatchHazardTicketPayload = Pick<HazardTicket, "owner_id" | "severity" | "deadline">;
export type RectifyHazardTicketPayload = Pick<HazardTicket, "rectify_note">;
