import { apiGet } from "../utils/http";
import { localDb, localListDeviceTickets } from "../mocks/localWorkflow";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicketView } from "../types/HazardTicket";

const endpoint = "/api/fire-device";

export async function listFireDevice(): Promise<FireDevice[]> {
  try {
    return await apiGet<FireDevice[]>(endpoint);
  } catch {
    // 离线降级：与整改单联动的本地设备状态
    return localDb.fireDevice.map((d) => ({
      ...d,
      building_name: localDb.building.find((b) => b.id === d.building_id)?.name ?? ""
    })) as FireDevice[];
  }
}

export async function listDeviceHazardTickets(deviceId: number): Promise<HazardTicketView[]> {
  try {
    return await apiGet<HazardTicketView[]>(`${endpoint}/${deviceId}/hazard-tickets`);
  } catch {
    return localListDeviceTickets(deviceId);
  }
}
