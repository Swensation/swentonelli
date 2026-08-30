#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { AutonomousSimulator } from "../src/simulator";
import { HarnessConfig } from "../src/types";

async function main() {
  const args = process.argv.slice(2);
  const title = args[0] || "Streamline UI footer padding";
  const feedback = args[1] || "Ensure bottom layout spacing on mobile screens is clean and responsive.";

  const configPath = path.resolve(__dirname, "../config.json");
  if (!fs.existsSync(configPath)) {
    console.error("Error: .harness/config.json not found in working directory.");
    process.exit(1);
  }

  const config: HarnessConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const simulator = new AutonomousSimulator(config);

  const success = await simulator.runScenario(title, feedback);
  process.exit(success ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal Simulator Error:", err);
  process.exit(1);
});
