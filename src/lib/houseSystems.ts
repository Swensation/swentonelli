import fs from "fs";
import path from "path";
import {
  HouseSystemsResponse,
  SmartDevice,
  SmartDeviceCategory,
  HouseSystemsSummary,
} from "@/types/houseSystems";
import { getValidSmartThingsToken } from "./smartthingsAuth";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "house_systems.json");

interface HouseSystemsRawData {
  houseName: string;
  address: string;
  devices: SmartDevice[];
}

export function getHouseSystemsData(): HouseSystemsResponse {
  let raw: HouseSystemsRawData = {
    houseName: "10 Bullard Lane",
    address: "10 Bullard Lane, Holliston, MA",
    devices: [],
  };

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      raw = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Error reading house_systems.json:", err);
  }

  const devices = raw.devices || [];

  // Categorize devices
  const devicesByCategory: Record<SmartDeviceCategory, SmartDevice[]> = {
    irrigation: [],
    climate: [],
    power: [],
    assistant: [],
  };

  const alerts: SmartDevice[] = [];
  let onlineCount = 0;
  let activeCount = 0;
  let warningCount = 0;
  let offlineCount = 0;
  let unconfiguredCount = 0;

  for (const device of devices) {
    if (devicesByCategory[device.category]) {
      devicesByCategory[device.category].push(device);
    }

    if (device.status === "warning") {
      warningCount++;
      alerts.push(device);
    } else if (device.status === "offline") {
      offlineCount++;
      alerts.push(device);
    } else if (device.status === "active") {
      activeCount++;
      onlineCount++;
    } else if (device.status === "online" || device.status === "idle") {
      onlineCount++;
    } else if (device.status === "unconfigured") {
      unconfiguredCount++;
    }
  }

  const summary: HouseSystemsSummary = {
    totalDevices: devices.length,
    onlineDevices: onlineCount,
    activeDevices: activeCount,
    warningDevices: warningCount,
    offlineDevices: offlineCount,
    unconfiguredDevices: unconfiguredCount,
    lastSyncTimestamp: new Date().toISOString(),
  };

  return {
    houseName: raw.houseName || "10 Bullard Lane",
    address: raw.address || "10 Bullard Lane, Holliston, MA",
    summary,
    alerts,
    devicesByCategory,
  };
}

/**
 * Fetches live device states if valid SmartThings token is available (with auto-refresh),
 * falling back to seeded cache on failure or missing token.
 */
export async function fetchLiveHouseSystemsData(): Promise<HouseSystemsResponse> {
  const baseData = getHouseSystemsData();
  const token = await getValidSmartThingsToken();

  if (!token) {
    return baseData;
  }

  try {
    const res = await fetch("https://api.smartthings.com/v1/devices", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      console.warn(`SmartThings API returned HTTP ${res.status}`);
      return baseData;
    }

    const stData = await res.json();
    const stDevices: any[] = stData.items || [];

    // Match SmartThings devices with our inventory (by ID or label)
    for (const stDevice of stDevices) {
      const stLabel = (stDevice.label || stDevice.name || "").toLowerCase();
      
      // Find matching device in our categories
      for (const cat of Object.keys(baseData.devicesByCategory) as SmartDeviceCategory[]) {
        for (const dev of baseData.devicesByCategory[cat]) {
          const devName = dev.name.toLowerCase();
          const devZone = (dev.roomOrZone || "").toLowerCase();
          
          if (
            (stDevice.deviceId === dev.id) ||
            (dev.provider === "smartthings" && (stLabel.includes("heat pump") || (stLabel.includes("thermostat") && devName.includes("thermostat")))) ||
            (dev.provider === "ecobee" && stLabel.includes("baseboard"))
          ) {
            // Query device status
            try {
              const statusRes = await fetch(
                `https://api.smartthings.com/v1/devices/${stDevice.deviceId}/status`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                  signal: AbortSignal.timeout(3000),
                }
              );

              if (statusRes.ok) {
                const statusJson = await statusRes.json();
                const main = statusJson.components?.main;
                if (main) {
                  if (!dev.telemetry) dev.telemetry = {};
                  
                  if (main.temperatureMeasurement?.temperature?.value !== undefined) {
                    dev.telemetry.temperature = Math.round(main.temperatureMeasurement.temperature.value);
                  }
                  if (main.thermostatCoolingSetpoint?.coolingSetpoint?.value !== undefined) {
                    dev.telemetry.targetTemperature = Math.round(main.thermostatCoolingSetpoint.coolingSetpoint.value);
                  }
                  if (main.thermostatHeatingSetpoint?.heatingSetpoint?.value !== undefined) {
                    dev.telemetry.targetTemperature = Math.round(main.thermostatHeatingSetpoint.heatingSetpoint.value);
                  }
                  if (main.switch?.switch?.value) {
                    dev.telemetry.powerState = main.switch.switch.value;
                    dev.status = main.switch.switch.value === "on" ? "active" : "online";
                  }
                  if (main.powerMeter?.power?.value !== undefined) {
                    dev.telemetry.currentWatts = Math.round(main.powerMeter.power.value);
                  }
                  if (main.thermostatMode?.thermostatMode?.value) {
                    dev.telemetry.hvacMode = main.thermostatMode.thermostatMode.value;
                    if (dev.telemetry.hvacMode === "cool" || dev.telemetry.hvacMode === "heat") {
                      dev.status = "active";
                    }
                  }
                  dev.lastUpdated = new Date().toISOString();
                }
              }
            } catch (fetchErr) {
              console.warn(`Could not fetch status for ST device ${stDevice.deviceId}`);
            }
          }
        }
      }
    }

    return baseData;
  } catch (err) {
    console.error("Error connecting to live SmartThings API:", err);
    return baseData;
  }
}
