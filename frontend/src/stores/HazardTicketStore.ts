import { create } from "zustand";
import {
  closeHazardTicket,
  dispatchHazardTicket,
  listDispatchableResults,
  listHazardTicket,
  submitHazardTicket
} from "../api/HazardTicket";
import type { DispatchableResult, HazardTicketView } from "../types/HazardTicket";

type DispatchForm = { result_id: number; severity: string; owner_id: number; deadline: string };

type State = {
  rows: HazardTicketView[];
  dispatchable: DispatchableResult[];
  loading: boolean;
  load: () => Promise<void>;
  loadDispatchable: () => Promise<void>;
  dispatch: (form: DispatchForm) => Promise<void>;
  submit: (ticketId: number, rectifyNote: string) => Promise<void>;
  close: (ticketId: number) => Promise<void>;
};

export const useHazardTicketStore = create<State>((set) => ({
  rows: [],
  dispatchable: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listHazardTicket(), loading: false });
  },
  async loadDispatchable() {
    set({ dispatchable: await listDispatchableResults() });
  },
  async dispatch(form) {
    await dispatchHazardTicket(form);
    const [rows, dispatchable] = await Promise.all([listHazardTicket(), listDispatchableResults()]);
    set({ rows, dispatchable });
  },
  async submit(ticketId, rectifyNote) {
    await submitHazardTicket(ticketId, rectifyNote);
    set({ rows: await listHazardTicket() });
  },
  async close(ticketId) {
    await closeHazardTicket(ticketId);
    set({ rows: await listHazardTicket() });
  }
}));
