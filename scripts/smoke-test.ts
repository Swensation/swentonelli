/**
 * Automated Verification & Smoke Test Suite
 *
 * Runs end-to-end checks on:
 * 1. TypeScript syntax & type validity across all .ts and .tsx files (`tsc --noEmit`)
 * 2. Data integrity (lunch_schedule.json structure & config/calendars.json structure)
 * 3. Next.js endpoints: /api/lunch, /api/calendar
 * 4. Webpage loading: GET / returns 200 HTML with ZERO Next.js compile errors or syntax overlays
 * 5. Web assets: All linked scripts & CSS stylesheets return HTTP 200 with no 404s
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function fetchUrl(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url);
  const body = await res.text();
  return { status: res.status, body };
}

async function findActivePort(): Promise<number> {
  const ports = [3000, 3001, 3002];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/lunch`, { signal: AbortSignal.timeout(2000) });
      if (res.status === 200) {
        return port;
      }
    } catch {
      // probe next port
    }
  }
  return 3000;
}

async function runTests() {
  console.log("==========================================");
  console.log("🧪 Running Dashboard Automated Test Suite");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  // 1. Static TypeScript & JSX Syntax Check across all files
  console.log("1. Checking TypeScript & JSX Syntax (tsc --noEmit)...");
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
    assert(true, "All TypeScript & TSX files pass typechecking and syntax validation");
  } catch (err: any) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    assert(false, "TypeScript Syntax / Type Check", output);
  }

  // 2. Check Data Integrity of lunch_schedule.json & config/calendars.json
  console.log("\n2. Checking Data Integrity (data/lunch_schedule.json & config/calendars.json)...");
  const dataPath = path.join(process.cwd(), "data", "lunch_schedule.json");
  assert(fs.existsSync(dataPath), "lunch_schedule.json exists");
  
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(raw);
    assert(!!json.month && !!json.year, "JSON contains month and year");
    assert(Object.keys(json.days).length > 0, `JSON contains ${Object.keys(json.days).length} menu days`);

    // Ensure items array exists and no (V) substrings remain
    let hasVTag = false;
    let hasItemsArray = true;
    for (const [date, day] of Object.entries<any>(json.days)) {
      if (!Array.isArray(day.items) || day.items.length === 0) {
        hasItemsArray = false;
      }
      if (day.items && day.items.some((i: string) => i.includes("(V)"))) {
        hasVTag = true;
      }
    }
    assert(hasItemsArray, "All days contain array of line items ('items')");
    assert(!hasVTag, "All item strings are clean (no '(V)' tags)");
  }

  // Verify config/calendars.json exists and contains valid sources
  const calConfigPath = path.join(process.cwd(), "config", "calendars.json");
  assert(fs.existsSync(calConfigPath), "config/calendars.json exists");
  if (fs.existsSync(calConfigPath)) {
    const calRaw = fs.readFileSync(calConfigPath, "utf-8");
    const calJson = JSON.parse(calRaw);
    assert(Array.isArray(calJson) && calJson.length > 0, `config/calendars.json contains ${calJson.length} active family calendar feeds`);
    assert(calJson.every((s: any) => s.name && s.icsUrl && s.color), "All calendar feeds have name, color, and icsUrl");
  }

  // 3. Discover active server port
  const activePort = await findActivePort();
  const BASE_URL = `http://localhost:${activePort}`;
  console.log(`\nActive Server Detected on: ${BASE_URL}`);

  // 4. Check API Endpoints
  console.log("\n3. Checking API Endpoints...");
  try {
    const lunchRes = await fetchUrl(`${BASE_URL}/api/lunch`);
    assert(lunchRes.status === 200, "GET /api/lunch returns HTTP 200");
    const lunchJson = JSON.parse(lunchRes.body);
    assert(Array.isArray(lunchJson.allDays), "GET /api/lunch returns allDays array");
  } catch (err: any) {
    assert(false, "GET /api/lunch", `Server unreachable: ${err.message}`);
  }

  try {
    const calRes = await fetchUrl(`${BASE_URL}/api/calendar`);
    assert(calRes.status === 200, "GET /api/calendar returns HTTP 200");
    const calJson = JSON.parse(calRes.body);
    assert(Array.isArray(calJson.today) && Array.isArray(calJson.tomorrow) && !!calJson.byDate, "GET /api/calendar returns valid agenda with byDate map");
  } catch (err: any) {
    assert(false, "GET /api/calendar", `Server unreachable: ${err.message}`);
  }

  // 5. Check Web Page & Next.js Error Overlay Detection
  console.log("\n4. Checking Webpage & Error Overlay Detection...");
  try {
    const pageRes = await fetchUrl(`${BASE_URL}/`);
    assert(pageRes.status === 200, "GET / returns HTTP 200 HTML");
    assert(pageRes.body.includes("Scouty Planner"), "Page contains Scouty Planner title");

    const hasErrorOverlay =
      pageRes.body.includes("Next.js Error") ||
      pageRes.body.includes("Unhandled Runtime Error") ||
      pageRes.body.includes("Syntax Error") ||
      pageRes.body.includes("Failed to compile");
    assert(!hasErrorOverlay, "Page renders cleanly with NO build/syntax error overlays");

    // Check that all linked JS scripts and CSS stylesheets load cleanly with 200
    const assetRegex = /(?:src|href)="(\/_next\/[^"]+)"/g;
    const matches = Array.from(pageRes.body.matchAll(assetRegex)).map((m) => m[1]);
    const uniqueAssets = Array.from(new Set(matches));

    console.log(`     Found ${uniqueAssets.length} static JS/CSS assets referenced in HTML. Verifying each...`);
    let allAssets200 = true;
    for (const assetPath of uniqueAssets) {
      const assetRes = await fetchUrl(`${BASE_URL}${assetPath}`);
      if (assetRes.status !== 200) {
        allAssets200 = false;
        console.error(`     ❌ Asset 404: ${assetPath} (status: ${assetRes.status})`);
      }
    }
    assert(allAssets200, "All static scripts and CSS load with HTTP 200 (No 404 errors)");
  } catch (err: any) {
    assert(false, "GET /", `Server unreachable: ${err.message}`);
  }

  console.log("\n==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
