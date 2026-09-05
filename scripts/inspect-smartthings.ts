/**
 * Inspect SmartThings Devices & Live Telemetry
 *
 * Queries the Samsung SmartThings REST API using SMARTTHINGS_PAT from .env.local
 *
 * Usage:
 *   npx tsx scripts/inspect-smartthings.ts
 */

import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { getValidSmartThingsToken } from "../src/lib/smartthingsAuth";

loadEnvLocal();

async function run() {
  console.log("==========================================");
  console.log("🔍 Samsung SmartThings Device Inspector");
  console.log("==========================================");

  const token = await getValidSmartThingsToken();

  if (!token) {
    console.log("❌ Missing SmartThings token.");
    console.log("Run 'npm run auth:smartthings' to sign in with OAuth PKCE.");
    console.log("Or add SMARTTHINGS_PAT=<token> to your .env.local file.");
    process.exit(1);
  }

  console.log("🔑 Active SmartThings token found. Connecting to SmartThings API...");


  try {
    const res = await fetch("https://api.smartthings.com/v1/devices", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ SmartThings API returned HTTP ${res.status}: ${res.statusText}`);
      const errBody = await res.text();
      console.error(errBody);
      process.exit(1);
    }

    const data = await res.json();
    const items = data.items || [];
    console.log(`\n✅ Connected successfully! Found ${items.length} SmartThings device(s):\n`);

    for (const item of items) {
      console.log(`------------------------------------------`);
      console.log(`📱 Device: ${item.label || item.name || "Unnamed Device"}`);
      console.log(`   ID: ${item.deviceId}`);
      console.log(`   Type: ${item.deviceManufacturerCode || item.type || "N/A"}`);
      console.log(`   Room ID: ${item.roomId || "None"}`);

      // Fetch live status for this device
      try {
        const statusRes = await fetch(`https://api.smartthings.com/v1/devices/${item.deviceId}/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const main = statusData.components?.main;
          if (main) {
            // Check common capabilities
            if (main.temperatureMeasurement) {
              console.log(`   🌡️ Temp: ${main.temperatureMeasurement.temperature?.value}°${main.temperatureMeasurement.temperature?.unit || "F"}`);
            }
            if (main.thermostatCoolingSetpoint) {
              console.log(`   🎯 Cooling Setpoint: ${main.thermostatCoolingSetpoint.coolingSetpoint?.value}°`);
            }
            if (main.thermostatHeatingSetpoint) {
              console.log(`   🎯 Heating Setpoint: ${main.thermostatHeatingSetpoint.heatingSetpoint?.value}°`);
            }
            if (main.thermostatMode) {
              console.log(`   ❄️ Mode: ${main.thermostatMode.thermostatMode?.value}`);
            }
            if (main.switch) {
              console.log(`   ⚡ Switch: ${main.switch.switch?.value}`);
            }
            if (main.powerMeter) {
              console.log(`   💡 Power: ${main.powerMeter.power?.value} W`);
            }
            if (main.battery) {
              console.log(`   🔋 Battery: ${main.battery.battery?.value}%`);
            }
            if (main.healthCheck) {
              console.log(`   📶 Health: ${main.healthCheck.healthStatus?.value}`);
            }
          }
        }
      } catch (err) {
        console.log(`   (Could not fetch status: ${(err as Error).message})`);
      }
    }
    console.log(`------------------------------------------\n`);
  } catch (error) {
    console.error("❌ Failed to query SmartThings API:", error);
  }
}

run();
