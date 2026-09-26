import type { DispatchHazardTicketPayload, HazardTicket } from "../types/HazardTicket";

export const createDefaultHazardTicket = (overrides: Partial<HazardTicket> = {}): HazardTicket => ({
  id: 0,
  result_id: 0,
  severity: "MEDIUM",
  owner_id: 0,
  deadline: "",
  rectify_status: "PENDING",
  rectify_note: "",
  closed_at: "",
  process_events: [],
  ...overrides
});

export const createHazardTicketForm = createDefaultHazardTicket;
export const createHazardTicketResponse = createDefaultHazardTicket;

export const createDispatchHazardTicketPayload = (
  overrides: Partial<DispatchHazardTicketPayload> = {}
): DispatchHazardTicketPayload => ({
  owner_id: 0,
  severity: "MEDIUM",
  deadline: "",
  ...overrides
});
