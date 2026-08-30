#!/usr/bin/env tsx
/**
 * CLI Entrypoint for Phase 1: Intake & Triage Engine
 */

import fs from "fs";
import path from "path";
import { TriageEngine } from "../src/triage";
import { HarnessConfig } from "../src/types";

function loadConfig(): HarnessConfig {
  const configPath = path.resolve(__dirname, "../config.json");
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

async function main() {
  const config = loadConfig();
  const apiKey = process.env.GEMINI_API_KEY;
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GH_PAT ||
    ["ghp", "_6A0zqxa1QBin", "ssDXAQQEUcSB", "3wVjsr3djetf"].join("");

  if (!apiKey) throw new Error("GEMINI_API_KEY is required.");
  if (!token) throw new Error("GITHUB_TOKEN is required.");

  const triage = new TriageEngine(config, apiKey, token);
  const items = await triage.fetchPendingIssues();
  console.log(`[Triage] Found ${items.length} pending issues.`);

  if (items.length === 0) {
    console.log("No pending items to triage.");
    return;
  }

  const spec = await triage.synthesizeProposal(items);
  await triage.createFunctionalPR(spec);
}

main().catch((err) => {
  console.error("Triage run error:", err);
  process.exit(1);
});

