import type { FireDevice } from "./FireDevice";
import type { HazardTicket } from "./HazardTicket";
import type { InspectionResult } from "./InspectionResult";

export interface FireDeviceDetail extends FireDevice {
  building_name: string;
  results: InspectionResult[];
  hazard_tickets: HazardTicket[];
}
