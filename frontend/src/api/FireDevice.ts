import { mockData } from "../mocks/seedData";
import type { InspectionResult } from "../types/InspectionResult";
import type { FireDevice } from "../types/FireDevice";
import type { FireDeviceDetail } from "../types/FireDeviceDetail";

const endpoint = "/api/fire-device";

export async function listFireDevice(): Promise<FireDevice[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.fireDevice as unknown as FireDevice[])];
}

export async function getFireDeviceDetail(deviceId: number): Promise<FireDeviceDetail> {
  try {
    const res = await fetch(`${endpoint}/${deviceId}`);
    if (res.ok) return await res.json();
  } catch {
    // Build an offline detail view from the local seed data.
  }

  const devices = mockData.fireDevice as unknown as FireDevice[];
  const device = devices.find((row) => row.id === deviceId) ?? devices[0];
  const results = (mockData.inspectionResult as unknown as InspectionResult[]).filter((row) => row.device_id === device.id);
  const resultIds = new Set(results.map((row) => row.id));
  const hazardTickets = (mockData.hazardTicket as unknown as FireDeviceDetail["hazard_tickets"]).filter((row) =>
    resultIds.has(row.result_id)
  );
  const building = (mockData.building as unknown as { id: number; name: string }[]).find(
    (row) => row.id === device.building_id
  );
  return { ...device, building_name: building?.name ?? "", results, hazard_tickets: hazardTickets };
}
