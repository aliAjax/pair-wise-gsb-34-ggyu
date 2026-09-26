import { create } from "zustand";
import { listDeviceHazardTickets, listFireDevice } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicketView } from "../types/HazardTicket";

type State = {
  rows: FireDevice[];
  deviceTickets: HazardTicketView[];
  loading: boolean;
  load: () => Promise<void>;
  loadDeviceTickets: (deviceId: number) => Promise<void>;
};

export const useFireDeviceStore = create<State>((set) => ({
  rows: [],
  deviceTickets: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFireDevice(), loading: false });
  },
  async loadDeviceTickets(deviceId) {
    set({ deviceTickets: await listDeviceHazardTickets(deviceId) });
  }
}));
