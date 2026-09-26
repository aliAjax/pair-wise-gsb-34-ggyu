import { create } from "zustand";
import {
  closeHazardTicket,
  dispatchHazardTicket,
  listHazardTicket,
  submitHazardTicketReview
} from "../api/HazardTicket";
import type { DispatchHazardTicketPayload, HazardTicket, RectifyHazardTicketPayload } from "../types/HazardTicket";

type State = {
  rows: HazardTicket[];
  loading: boolean;
  actionError: string;
  load: () => Promise<void>;
  dispatch: (ticketId: number, payload: DispatchHazardTicketPayload) => Promise<void>;
  submitReview: (ticketId: number, payload: RectifyHazardTicketPayload) => Promise<void>;
  close: (ticketId: number) => Promise<void>;
  clearError: () => void;
};

const mergeTicket = (rows: HazardTicket[], ticket: HazardTicket) =>
  rows.map((row) => (row.id === ticket.id ? ticket : row));

export const useHazardTicketStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  actionError: "",
  async load() {
    set({ loading: true, actionError: "" });
    try {
      set({ rows: await listHazardTicket(), loading: false });
    } catch (error) {
      set({ loading: false, actionError: error instanceof Error ? error.message : "加载失败" });
    }
  },
  async dispatch(ticketId, payload) {
    const ticket = await dispatchHazardTicket(ticketId, payload);
    set({ rows: mergeTicket(get().rows, ticket), actionError: "" });
  },
  async submitReview(ticketId, payload) {
    const ticket = await submitHazardTicketReview(ticketId, payload);
    set({ rows: mergeTicket(get().rows, ticket), actionError: "" });
  },
  async close(ticketId) {
    const ticket = await closeHazardTicket(ticketId);
    set({ rows: mergeTicket(get().rows, ticket), actionError: "" });
  },
  clearError() {
    set({ actionError: "" });
  }
}));
