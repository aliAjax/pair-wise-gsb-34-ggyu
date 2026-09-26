import type { FireDevice } from "../../types/FireDevice";

const deviceTypeText: Record<string, string> = {
  EXTINGUISHER: "灭火器",
  HYDRANT: "消火栓",
  SMOKE_DETECTOR: "烟感探测器",
  SPRINKLER: "喷淋头",
  EXIT_LIGHT: "疏散指示灯"
};

export function DeviceLocationCell({ device }: { device: FireDevice }) {
  return (
    <div className="device-location">
      <strong>{device.device_code}</strong>
      <span>{deviceTypeText[device.device_type] ?? device.device_type} · {device.floor} · {device.location_desc}</span>
    </div>
  );
}
