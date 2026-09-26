import { apiGet } from "../utils/http";
import { localDb } from "../mocks/localWorkflow";
import type { Building } from "../types/Building";

const endpoint = "/api/building";

export async function listBuilding(): Promise<Building[]> {
  try {
    return await apiGet<Building[]>(endpoint);
  } catch {
    // 离线降级：本地种子数据
    return [...(localDb.building as unknown as Building[])];
  }
}
