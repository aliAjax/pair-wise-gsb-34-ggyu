import { apiGet } from "../utils/http";
import { localDb } from "../mocks/localWorkflow";
import type { InspectionResult } from "../types/InspectionResult";

const endpoint = "/api/inspection-result";

export async function listInspectionResult(): Promise<InspectionResult[]> {
  try {
    return await apiGet<InspectionResult[]>(endpoint);
  } catch {
    // 离线降级：本地种子数据
    return [...(localDb.inspectionResult as InspectionResult[])];
  }
}
