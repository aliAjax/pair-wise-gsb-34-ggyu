import { create } from "zustand";
import type { Role } from "../constants/roles";

const STORAGE_KEY = "fire-inspect-role";

type State = { role: Role; setRole: (role: Role) => void };

export const useSessionStore = create<State>((set) => ({
  role: (localStorage.getItem(STORAGE_KEY) as Role) || "SUPERVISOR",
  setRole(role) {
    localStorage.setItem(STORAGE_KEY, role);
    set({ role });
  }
}));
