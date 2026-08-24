/**
 * Automated Verification & Smoke Test Suite
 *
 * Runs end-to-end checks on:
 * 1. TypeScript syntax & type validity across all .ts and .tsx files (`tsc --noEmit`)
 * 2. Data integrity (lunch_schedule.json, config/calendars.json, config/event_rules.json, team assets)
 * 3. Business Rules Engine unit tests (Child resolution & OSFC icon attribution)
 * 4. Next.js endpoints: /api/lunch, /api/calendar, /api/admin
 * 5. Webpage loading: GET / and GET /admin return 200 HTML with ZERO Next.js compile errors or syntax overlays
 * 6. Web assets: All linked scripts & CSS stylesheets return HTTP 200 with no 404s
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { enrichCalendarEvent } from "../src/lib/eventRules";

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

  // 2. Check Data Integrity
  console.log("\n2. Checking Data Integrity & Configuration Files...");
  const dataPath = path.join(process.cwd(), "data", "lunch_schedule.json");
  assert(fs.existsSync(dataPath), "lunch_schedule.json exists");
  
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(raw);
    assert(!!json.month && !!json.year, "JSON contains month and year");
    assert(Object.keys(json.days).length > 0, `JSON contains ${Object.keys(json.days).length} menu days`);

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

  // Verify OSFC logo asset exists
  const osfcLogoPath = path.join(process.cwd(), "public", "icons", "teams", "osfc.png");
  assert(fs.existsSync(osfcLogoPath), "public/icons/teams/osfc.png asset exists");
  if (fs.existsSync(osfcLogoPath)) {
    const stats = fs.statSync(osfcLogoPath);
    assert(stats.size > 1000, `OSFC team logo is valid binary image (${stats.size} bytes)`);
  }

  // 3. Business Rules Engine Unit Tests
  console.log("\n3. Testing Business Rules Engine (Child Resolution & Categorization)...");
  const osfcEnrichment = enrichCalendarEvent({
    summary: "Practice: OSFC Girls U13 Monday Training - U13 Girls",
    description: "Old school football club training at midfield",
    sourceName: "Aria and Ben",
  });
  assert(osfcEnrichment?.child?.name === "Aria", "OSFC event resolves to Aria");
  assert(osfcEnrichment?.category === "OSFC Soccer", "OSFC event category is 'OSFC Soccer'");
  assert(osfcEnrichment?.iconUrl === "/icons/teams/osfc.png", "OSFC event attaches '/icons/teams/osfc.png' logo");

  const brightonEnrichment = enrichCalendarEvent({
    summary: "Brighton Field Hockey Game vs Westwood",
    sourceName: "Brighton and Bennett",
  });
  assert(brightonEnrichment?.child?.name === "Brighton", "Field hockey event resolves to Brighton");
  assert(brightonEnrichment?.iconName === "Calendar", "Default non-custom event uses generic Calendar icon");

  // 4. Discover active server port
  const activePort = await findActivePort();
  const BASE_URL = `http://localhost:${activePort}`;
  console.log(`\nActive Server Detected on: ${BASE_URL}`);

  // 5. Check API Endpoints
  console.log("\n4. Checking API Endpoints...");
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

    const todayOsfc = calJson.today.find((e: any) => e.summary.includes("OSFC"));
    if (todayOsfc) {
      assert(todayOsfc.enrichment?.iconUrl === "/icons/teams/osfc.png", "Today's OSFC event is enriched with OSFC logo in live API");
      assert(todayOsfc.enrichment?.child?.name === "Aria", "Today's OSFC event has Aria child badge");
    }
  } catch (err: any) {
    assert(false, "GET /api/calendar", `Server unreachable: ${err.message}`);
  }

  try {
    const adminRes = await fetchUrl(`${BASE_URL}/api/admin`);
    assert(adminRes.status === 200, "GET /api/admin returns HTTP 200");
    const adminJson = JSON.parse(adminRes.body);
    assert(!!adminJson.calendar && Array.isArray(adminJson.calendar.activeRules), "GET /api/admin returns calendar active rules");
    assert(Array.isArray(adminJson.calendar.missingIconCategories), "GET /api/admin returns missing icon categories");
    assert(!!adminJson.lunch && Array.isArray(adminJson.lunch.upcomingMissingMonths), "GET /api/admin returns lunch housekeeping");
  } catch (err: any) {
    assert(false, "GET /api/admin", `Server unreachable: ${err.message}`);
  }

  // 6. Check Web Pages & Next.js Error Overlay Detection
  console.log("\n5. Checking Webpages & Error Overlay Detection...");
  try {
    // 6a. Main Kiosk Page
    const pageRes = await fetchUrl(`${BASE_URL}/`);
    assert(pageRes.status === 200, "GET / returns HTTP 200 HTML");
    assert(pageRes.body.includes("Scouty Planner"), "Page contains Scouty Planner title");
    assert(pageRes.body.includes("/admin"), "Page contains link to Dad Admin & Housekeeping");

    const hasErrorOverlay =
      pageRes.body.includes("Next.js Error") ||
      pageRes.body.includes("Unhandled Runtime Error") ||
      pageRes.body.includes("Syntax Error") ||
      pageRes.body.includes("Failed to compile");
    assert(!hasErrorOverlay, "Page / renders cleanly with NO build/syntax error overlays");

    // 6b. Admin Housekeeping Page
    const adminPageRes = await fetchUrl(`${BASE_URL}/admin`);
    assert(adminPageRes.status === 200, "GET /admin returns HTTP 200 HTML");
    assert(adminPageRes.body.includes("Housekeeping"), "Admin page contains Housekeeping title");

    const hasAdminErrorOverlay =
      adminPageRes.body.includes("Next.js Error") ||
      adminPageRes.body.includes("Unhandled Runtime Error") ||
      adminPageRes.body.includes("Syntax Error") ||
      adminPageRes.body.includes("Failed to compile");
    assert(!hasAdminErrorOverlay, "Page /admin renders cleanly with NO build/syntax error overlays");

    // 6c. Check static JS/CSS assets
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
    assert(false, "Webpage checks", `Server unreachable: ${err.message}`);
  }

  console.log("\n==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
