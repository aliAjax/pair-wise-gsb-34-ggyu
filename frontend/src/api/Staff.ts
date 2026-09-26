import { apiGet } from "../utils/http";
import { localDb } from "../mocks/localWorkflow";
import type { Staff } from "../types/Staff";

const endpoint = "/api/staff";

export async function listStaff(role?: string): Promise<Staff[]> {
  try {
    return await apiGet<Staff[]>(role ? `${endpoint}?role=${role}` : endpoint);
  } catch {
    const rows = localDb.staff as Staff[];
    return role ? rows.filter((s) => s.role === role) : [...rows];
  }
}
