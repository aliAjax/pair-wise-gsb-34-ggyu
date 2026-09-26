import type { FireDevice } from "../../types/FireDevice";

export function DeviceLocationCell({ device }: { device: FireDevice }) {
  return (
    <span className="location-cell">
      <strong>{device.building_name ?? ""}</strong>
      <span className="cell-sub">{device.floor} · {device.location_desc}</span>
    </span>
  );
}
