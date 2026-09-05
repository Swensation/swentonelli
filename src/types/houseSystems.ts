export type SmartDeviceCategory = "climate" | "irrigation" | "power" | "assistant";

export type SmartDeviceStatus = "online" | "active" | "idle" | "warning" | "offline" | "unconfigured";

export interface SmartDeviceTelemetry {
  temperature?: number;
  targetTemperature?: number;
  humidity?: number;
  hvacMode?: string;
  fanMode?: string;
  wateringZone?: string;
  wateringMinutesRemaining?: number;
  nextScheduledRun?: string;
  powerState?: "on" | "off";
  currentWatts?: number;
  batteryPercent?: number;
  wifiSignal?: string;
}

export interface SmartDeviceError {
  code: string;
  message: string;
  severity: "warning" | "critical";
  timestamp?: string;
}

export interface SmartDevice {
  id: string;
  name: string;
  category: SmartDeviceCategory;
  roomOrZone?: string;
  provider: string;
  providerBrandName: string;
  status: SmartDeviceStatus;
  statusDetail?: string;
  dadTodo?: string;
  telemetry?: SmartDeviceTelemetry;
  error?: SmartDeviceError;
  lastUpdated?: string;
  appManageHint?: string;
}

export interface HouseSystemsSummary {
  totalDevices: number;
  onlineDevices: number;
  activeDevices: number;
  warningDevices: number;
  offlineDevices: number;
  unconfiguredDevices: number;
  lastSyncTimestamp?: string;
}

export interface HouseSystemsResponse {
  houseName: string;
  address: string;
  summary: HouseSystemsSummary;
  alerts: SmartDevice[];
  devicesByCategory: Record<SmartDeviceCategory, SmartDevice[]>;
}
