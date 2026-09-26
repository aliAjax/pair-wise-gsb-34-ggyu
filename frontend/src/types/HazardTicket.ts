import type { HazardSeverity } from "./HazardSeverity";
import type { RectifyStatus } from "./RectifyStatus";

export interface HazardTicketEvent {
  action: "DISPATCH" | "SUBMIT" | "CLOSE";
  actor: string;
  role: string;
  at: string;
  detail: string;
}

export interface HazardTicket {
  id: number;
  result_id: number;
  severity: HazardSeverity;
  owner_id: number;
  deadline: string;
  rectify_status: RectifyStatus;
  rectify_note: string;
  closed_at: string;
  history: HazardTicketEvent[];
}

export interface HazardTicketView extends HazardTicket {
  owner_name: string;
  device_id: number;
  device_code: string;
  device_type: string;
  building_name: string;
  floor: string;
  location_desc: string;
  item_code: string;
  result_note: string;
  overdue: boolean;
}

export interface DispatchableResult {
  result_id: number;
  device_id: number;
  device_code: string;
  building_name: string;
  floor: string;
  location_desc: string;
  item_code: string;
  note: string;
  measured_value: string;
}
