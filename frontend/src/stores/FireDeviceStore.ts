import { create } from "zustand";
import { getFireDeviceDetail, listFireDevice } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";
import type { FireDeviceDetail } from "../types/FireDeviceDetail";

type State = {
  rows: FireDevice[];
  detail?: FireDeviceDetail;
  loading: boolean;
  load: () => Promise<void>;
  loadDetail: (deviceId: number) => Promise<void>;
};

export const useFireDeviceStore = create<State>((set) => ({
  rows: [],
  detail: undefined,
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFireDevice(), loading: false });
  },
  async loadDetail(deviceId) {
    set({ loading: true });
    set({ detail: await getFireDeviceDetail(deviceId), loading: false });
  }
}));
