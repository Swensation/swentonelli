/**
 * Automated Verification & Smoke Test Suite
 *
 * Runs end-to-end checks on:
 * 1. TypeScript syntax & type validity across all .ts and .tsx files (`tsc --noEmit`)
 * 2. Data integrity (lunch_schedule.json, calendars.json, event_rules.json, suggested_icons.json, children_registry.json)
 * 3. 4 Child profile avatar assets (Aria Glinda, Brighton Elphaba, Benjamin Fortnite, Bennett Moe's Tavern)
 * 4. Child Profiles Registry unit tests (Aria Millis/7th/Coastal Counseling, Brighton Adams/6th/Field Hockey, Benjamin CFB/5th/Kelley, Bennett Miller/4th/Football)
 * 5. Annotations & Badges unit tests (Custody rules for Liz, Andrew/Swen, Callie, Chris + No-School status)
 * 6. Business Rules Engine & Dynamic AI Discovery unit tests (Child resolution, OSFC, Adams, FH, Miller, Therapy, Level99, Venues)
 * 7. Next.js endpoints: /api/lunch, /api/calendar, /api/admin, /api/admin/approve-icon
 * 8. Admin Radar Check: Custody and No-School events are strictly excluded from Missing Icon lists
 * 9. Strict Zero-Date Header Rule: No widget renders redundant internal date headers
 * 10. Webpage loading: GET / and GET /admin return 200 HTML with ZERO Next.js compile errors or syntax overlays
 * 11. Web assets: All linked scripts & CSS stylesheets return HTTP 200 with no 404s
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { CalendarEvent } from "../src/types/calendar";
import { enrichCalendarEvent } from "../src/lib/eventRules";
import { discoverIconForEventGroup } from "../src/lib/iconDiscovery";
import { extractChildAnnotations, isAnnotationEvent, filterActivityEvents } from "../src/lib/annotations";
import { getChildrenRegistry, findChildByEventText } from "../src/lib/childrenRegistry";

async function fetchUrl(url: string, options?: RequestInit): Promise<{ status: number; body: string }> {
  const res = await fetch(url, options);
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

  // 2. Check Data Integrity & Specs
  console.log("\n2. Checking Data Integrity & Specs...");
  const dataPath = path.join(process.cwd(), "data", "lunch_schedule.json");
  assert(fs.existsSync(dataPath), "lunch_schedule.json exists");
  
  const annotationsSpecPath = path.join(process.cwd(), "specs", "annotations-and-badges.spec.md");
  assert(fs.existsSync(annotationsSpecPath), "specs/annotations-and-badges.spec.md exists");

  const familyRegistrySpecPath = path.join(process.cwd(), "specs", "family-registry.spec.md");
  assert(fs.existsSync(familyRegistrySpecPath), "specs/family-registry.spec.md exists");

  const childrenRegistryDataPath = path.join(process.cwd(), "data", "children_registry.json");
  assert(fs.existsSync(childrenRegistryDataPath), "data/children_registry.json exists");

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

  // Verify icon assets exist
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "teams", "osfc.png")), "OSFC team logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "schools", "adams.png")), "Adams Rams logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "teams", "brighton_field_hockey.png")), "Holliston Field Hockey logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "schools", "miller.png")), "Miller School logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "general", "therapy.png")), "Therapy logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "general", "holliston_pediatrics.png")), "Holliston Pediatrics logo exists");

  // Verify 4 child avatar profile icons exist
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "aria.png")), "Aria Galinda (Wicked) avatar exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "brighton.png")), "Brighton Elphaba (Wicked) avatar exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "benjamin.png")), "Benjamin Fortnite avatar exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "bennett.png")), "Bennett Moe's Tavern avatar exists");

  // 3. Child Profiles Registry Unit Tests
  console.log("\n3. Testing Child Profiles Registry & Accurate Family Attributes...");
  const registry = getChildrenRegistry();
  assert(registry.length === 4, `Children registry loads 4 child profiles (found ${registry.length})`);

  // Aria checks
  const aria = registry.find(c => c.id === "aria");
  assert(!!aria && aria.school.includes("Millis") && aria.grade.includes("7th") && aria.therapist.includes("Coastal Counseling"), "Aria: Millis Middle School, 7th Grade, Coastal Counseling");
  assert(!!aria && aria.primarySport.includes("Soccer"), "Aria primary sport is Soccer");

  // Brighton checks
  const brighton = registry.find(c => c.id === "brighton");
  assert(!!brighton && brighton.school.includes("Adams") && brighton.grade.includes("6th") && brighton.therapist.includes("Coastal Counseling"), "Brighton: Adams Middle School, 6th Grade, Coastal Counseling");
  assert(!!brighton && brighton.primarySport === "Field Hockey", "Brighton primary sport is Field Hockey");

  // Benjamin checks
  const benjamin = registry.find(c => c.id === "benjamin");
  assert(!!benjamin && benjamin.school.includes("CFB") && benjamin.grade.includes("5th") && benjamin.therapist === "Kelley", "Benjamin: CFB (Millis), 5th Grade, Therapist Kelley (spelled K-E-L-L-E-Y)");

  // Bennett checks
  const bennett = registry.find(c => c.id === "bennett");
  assert(!!bennett && bennett.school.includes("Miller") && bennett.grade.includes("4th") && bennett.teacher.includes("Pellegri") && bennett.primarySport === "Football", "Bennett: Miller School, 4th Grade, Katie Pellegri, Football");

  // Keyword resolution tests
  const bennettByGrade = findChildByEventText("4th Grade Classroom Meet and Greet");
  assert(bennettByGrade?.id === "bennett", "'4th Grade Classroom Meet and Greet' automatically maps to Bennett");

  const bennettByTeacher = findChildByEventText("Conference with Katie Pellegri");
  assert(bennettByTeacher?.id === "bennett", "'Conference with Katie Pellegri' automatically maps to Bennett");

  const benjaminByTherapist = findChildByEventText("Weekly check-in with Kelley");
  assert(benjaminByTherapist?.id === "benjamin", "'Weekly check-in with Kelley' automatically maps to Benjamin");

  const ariaByCoastal = findChildByEventText("Session with Coastal Counseling for Aria");
  assert(ariaByCoastal?.id === "aria" || ariaByCoastal?.id === "brighton", "'Coastal Counseling' maps to Aria/Brighton");

  // 4. Testing Custody & Annotation Badges Engine
  console.log("\n4. Testing Custody & Annotation Badges Engine...");
  const mockLizEvent: CalendarEvent = { id: "1", sourceId: "mock", color: "#3b82f6", summary: "Liz kids", start: "2026-08-24T00:00:00Z", end: "2026-08-24T23:59:59Z", allDay: true, sourceName: "Family" };
  const mockSwenEvent: CalendarEvent = { id: "2", sourceId: "mock", color: "#3b82f6", summary: "Swen kids", start: "2026-08-24T00:00:00Z", end: "2026-08-24T23:59:59Z", allDay: true, sourceName: "Family" };
  const mockCallieEvent: CalendarEvent = { id: "3", sourceId: "mock", color: "#3b82f6", summary: "Callie kids", start: "2026-08-24T00:00:00Z", end: "2026-08-24T23:59:59Z", allDay: true, sourceName: "Family" };
  const mockNoSchoolEvent: CalendarEvent = { id: "4", sourceId: "mock", color: "#3b82f6", summary: "No School - Teacher Professional Day", start: "2026-08-24T00:00:00Z", end: "2026-08-24T23:59:59Z", allDay: true, sourceName: "Holliston Schools" };
  const mockSoccerEvent: CalendarEvent = { id: "5", sourceId: "mock", color: "#3b82f6", summary: "OSFC U13 Soccer Practice", start: "2026-08-24T17:00:00Z", end: "2026-08-24T18:30:00Z", allDay: false, sourceName: "Aria and Ben" };

  // Annotation filter checks
  assert(isAnnotationEvent(mockLizEvent), "isAnnotationEvent returns true for 'Liz kids'");
  assert(isAnnotationEvent(mockSwenEvent), "isAnnotationEvent returns true for 'Swen kids'");
  assert(isAnnotationEvent(mockCallieEvent), "isAnnotationEvent returns true for 'Callie kids'");
  assert(isAnnotationEvent(mockNoSchoolEvent), "isAnnotationEvent returns true for 'No School'");
  assert(!isAnnotationEvent(mockSoccerEvent), "isAnnotationEvent returns false for regular 'OSFC U13 Soccer Practice'");

  const filtered = filterActivityEvents([mockLizEvent, mockNoSchoolEvent, mockSoccerEvent]);
  assert(filtered.length === 1 && filtered[0].summary === "OSFC U13 Soccer Practice", "filterActivityEvents excludes custody/no-school banners from timeline cards");

  // Brighton / Bennett Custody extraction
  const brightonMomAnno = extractChildAnnotations([mockLizEvent, mockSoccerEvent], "brighton");
  assert(brightonMomAnno.custody?.status === "mom" && brightonMomAnno.custody?.parentName === "Liz", "Brighton with 'Liz kids' resolves to With Mom (Liz)");

  const bennettDadAnno = extractChildAnnotations([mockSwenEvent, mockSoccerEvent], "bennett");
  assert(bennettDadAnno.custody?.status === "dad" && bennettDadAnno.custody?.parentName === "Andrew", "Bennett with 'Swen kids' resolves to With Dad (Andrew)");

  // Aria / Benjamin Custody extraction
  const ariaMomAnno = extractChildAnnotations([mockCallieEvent], "aria");
  assert(ariaMomAnno.custody?.status === "mom" && ariaMomAnno.custody?.parentName === "Callie", "Aria with 'Callie kids' resolves to With Mom (Callie)");

  const benDadAnno = extractChildAnnotations([], "benjamin");
  assert(benDadAnno.custody?.status === "dad" && benDadAnno.custody?.parentName === "Chris", "Benjamin without 'Callie kids' defaults to With Dad (Chris)");

  // No-School extraction
  const schoolAnno = extractChildAnnotations([mockNoSchoolEvent], "aria");
  assert(schoolAnno.school?.status === "no_school" && schoolAnno.school?.label === "No School", "Child with no-school event resolves to 'No School' badge");

  // 5. Business Rules Engine Unit Tests
  console.log("\n5. Testing Business Rules Engine & Dynamic AI Discovery...");
  const osfcEnrichment = enrichCalendarEvent({
    summary: "Practice: OSFC Girls U13 Monday Training - U13 Girls",
    description: "Old school football club training at midfield",
    sourceName: "Aria and Ben",
  });
  assert(osfcEnrichment?.child?.name === "Aria", "OSFC event resolves to Aria");
  assert(osfcEnrichment?.category === "OSFC Soccer", "OSFC event category is 'OSFC Soccer'");
  assert(osfcEnrichment?.iconUrl === "/icons/teams/osfc.png", "OSFC event attaches '/icons/teams/osfc.png' logo");

  const adamsEnrichment = enrichCalendarEvent({
    summary: "Adams Middle School 8th Grade Orientation",
    description: "Welcome to Adams Middle School Rams orientation",
    sourceName: "Aria and Ben",
  });
  assert(adamsEnrichment?.category === "Adams Middle School", "Adams orientation resolves to 'Adams Middle School'");
  assert(adamsEnrichment?.iconUrl === "/icons/schools/adams.png", "Adams event attaches '/icons/schools/adams.png' logo");

  const brightonEnrichment = enrichCalendarEvent({
    summary: "Brighton Practice @ Patoma (Field Hockey)",
    description: "Holliston youth field hockey practice at Patoma",
    sourceName: "Brighton and Bennett",
  });
  assert(brightonEnrichment?.child?.name === "Brighton", "Field hockey event resolves to Brighton");
  assert(brightonEnrichment?.category === "Field Hockey", "Field hockey event category is 'Field Hockey'");
  assert(brightonEnrichment?.iconUrl === "/icons/teams/brighton_field_hockey.png", "Field hockey event attaches '/icons/teams/brighton_field_hockey.png' logo");

  // Miller 4th Grade Meet and Greet Test (Matches Miller School + Bennett)
  const millerEnrichment = enrichCalendarEvent({
    summary: "4th Grade Classroom Meet and Greet with Katie Pellegri",
    description: "Miller elementary school meet and greet in Room 104",
    sourceName: "Brighton and Bennett",
  });
  assert(millerEnrichment?.category === "Miller Elementary School", "'4th Grade Classroom Meet and Greet' resolves to 'Miller Elementary School'");
  assert(millerEnrichment?.iconUrl === "/icons/schools/miller.png", "Miller event attaches '/icons/schools/miller.png' logo");
  assert(millerEnrichment?.child?.name === "Bennett", "'4th Grade Classroom Meet and Greet' resolves to child 'Bennett'");

  const therapyEnrichment = enrichCalendarEvent({
    summary: "Weekly Speech Therapy Session",
    description: "Speech and occupational therapy appointment",
    sourceName: "Aria and Ben",
  });
  assert(therapyEnrichment?.category === "Therapy", "Therapy session resolves to 'Therapy'");
  assert(therapyEnrichment?.iconUrl === "/icons/general/therapy.png", "Therapy event attaches '/icons/general/therapy.png' logo");

  const pediatricsEnrichment = enrichCalendarEvent({
    summary: "Bennett Annual Well Visit with Dr. Urban",
    description: "Holliston pediatric group yearly checkup",
    sourceName: "Brighton and Bennett",
  });
  assert(pediatricsEnrichment?.category === "Holliston Pediatrics", "Dr. Urban visit resolves to 'Holliston Pediatrics'");
  assert(pediatricsEnrichment?.iconUrl === "/icons/general/holliston_pediatrics.png", "Dr. Urban visit attaches '/icons/general/holliston_pediatrics.png' logo");

  // Dynamic AI Venue Discovery Tests
  const level99Discovery = discoverIconForEventGroup("Juliana’s bday Level99 in Natick");
  assert(!!level99Discovery, "AI Discovery matches Level99 event");
  assert(level99Discovery?.sourceDomain === "level99.com", "AI Discovery correctly infers level99.com domain");
  assert(!!level99Discovery?.category.includes("Level99"), "AI Discovery identifies Level99 category");
  assert(!!level99Discovery?.candidateIconUrl, "AI Discovery generates high-res candidate logo URL for Level99");

  const urbanAirDiscovery = discoverIconForEventGroup("Lucas 9th Birthday Party at Urban Air");
  assert(!!urbanAirDiscovery && urbanAirDiscovery.sourceDomain === "urbanair.com", "AI Discovery dynamically resolves Urban Air to urbanair.com");

  const danceDiscovery = discoverIconForEventGroup("Spring Ballet & Dance Recital");
  assert(!!danceDiscovery && Boolean(danceDiscovery.badgeText.includes("Recital")), "AI Discovery resolves dance recital to performing arts badge");

  // 6. Discover active server port
  const activePort = await findActivePort();
  const BASE_URL = `http://localhost:${activePort}`;
  console.log(`\nActive Server Detected on: ${BASE_URL}`);

  // 7. Check API Endpoints
  console.log("\n6. Checking API Endpoints...");
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

    assert(!!adminJson.general && !!adminJson.general.kioskUrl, "GET /api/admin returns General overview data");
    assert(Array.isArray(adminJson.childrenRegistry) && adminJson.childrenRegistry.length === 4, "GET /api/admin returns 4 child profiles in childrenRegistry");
    assert(!!adminJson.calendar && Array.isArray(adminJson.calendar.missingIcons), "GET /api/admin returns dynamic 30-day missing icons array");
    
    // Check that custody & no school events are strictly NOT in missingIcons
    const hasCustodyInMissing = adminJson.calendar.missingIcons.some((m: any) =>
      m.summaryGroup.toLowerCase().includes("kids") ||
      m.summaryGroup.toLowerCase().includes("liz") ||
      m.summaryGroup.toLowerCase().includes("callie") ||
      m.summaryGroup.toLowerCase().includes("swen") ||
      m.summaryGroup.toLowerCase().includes("no school")
    );
    assert(!hasCustodyInMissing, "Admin missingIcons radar strictly excludes custody and no-school annotation events");

    assert(adminJson.calendar.missingIcons.length > 0, `GET /api/admin dynamically detected ${adminJson.calendar.missingIcons.length} unbranded activity groups in next 30 days`);
    assert(!!adminJson.lunch && typeof adminJson.lunch.thirtyDaySchoolDaysTotal === "number", "GET /api/admin returns 30-day school lunch coverage");

    const childTasks = adminJson.calendar.dadChecklist.filter((t: any) => t.category === "children");
    assert(childTasks.length === 4, "Admin checklist contains 4 child profile icon to-dos (Aria, Brighton, Benjamin, Bennett)");
    assert(childTasks.every((t: any) => t.status === "done"), "All 4 child profile avatars are marked DONE in Dad's checklist");
  } catch (err: any) {
    assert(false, "GET /api/admin", `Server unreachable: ${err.message}`);
  }

  // 8. Check Web Pages, Zero-Date Headers & Error Overlay Detection
  console.log("\n7. Checking Webpages, 4-Column Layout & Badges UI...");
  try {
    // 8a. Main Kiosk Page
    const pageRes = await fetchUrl(`${BASE_URL}/`);
    assert(pageRes.status === 200, "GET / returns HTTP 200 HTML");
    assert(pageRes.body.includes("Scouty Planner"), "Page contains Scouty Planner title");
    assert(pageRes.body.includes("Kids Columns"), "Page contains 4-Column Kids view switcher");
    assert(pageRes.body.includes("All Events"), "Page contains Aggregate stream view switcher");
    
    // Check 4-Column Kids Timeline component file
    const kidsTimelineFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "CalendarWidget", "KidsColumnTimeline.tsx"), "utf-8");
    assert(
      kidsTimelineFile.includes('"Aria"') &&
      kidsTimelineFile.includes('"Brighton"') &&
      kidsTimelineFile.includes('"Benjamin"') &&
      kidsTimelineFile.includes('"Bennett"'),
      "KidsColumnTimeline configures 4 child columns: Aria, Brighton, Benjamin, Bennett"
    );
    assert(
      kidsTimelineFile.includes("extractChildAnnotations") && kidsTimelineFile.includes("filterActivityEvents"),
      "KidsColumnTimeline integrates annotations engine for custody and no-school badges"
    );

    // Zero Date Header Rule Check: Ensure neither widget renders internal date subtitles
    const calWidgetFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "CalendarWidget", "CalendarWidget.tsx"), "utf-8");
    const lunchWidgetFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "LunchWidget", "LunchWidget.tsx"), "utf-8");
    assert(!calWidgetFile.includes("formattedDayTitle") && !calWidgetFile.includes("<div className=\"text-xs font-extrabold uppercase"), "CalendarWidget complies with zero-date display rule");
    assert(!lunchWidgetFile.includes("{activeDay.date}"), "LunchWidget complies with zero-date display rule");

    const hasErrorOverlay =
      pageRes.body.includes("Next.js Error") ||
      pageRes.body.includes("Unhandled Runtime Error") ||
      pageRes.body.includes("Syntax Error") ||
      pageRes.body.includes("Failed to compile");
    assert(!hasErrorOverlay, "Page / renders cleanly with NO build/syntax error overlays");

    // 8b. Admin Housekeeping Page (Tabbed UI & 1-Click Approval UI Check)
    const adminPageRes = await fetchUrl(`${BASE_URL}/admin`);
    assert(adminPageRes.status === 200, "GET /admin returns HTTP 200 HTML");

    // Verify Tab implementations in Admin page source file
    const adminSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "admin", "page.tsx"), "utf-8");
    assert(adminSource.includes("General Overview"), "Admin page implements 'General Overview' tab");
    assert(adminSource.includes("Child Profiles & Schedules") || adminSource.includes("Child Profiles &amp; Schedules"), "Admin page implements 'Child Profiles & Schedules' tab");
    assert(adminSource.includes("Family Calendar"), "Admin page implements 'Family Calendar' tab");
    assert(adminSource.includes("School Lunch"), "Admin page implements 'School Lunch' tab");
    assert(
      adminSource.includes("handleApproveIcon"),
      "Admin page implements 1-click icon approval engine with handleApproveIcon"
    );

    const hasAdminErrorOverlay =
      adminPageRes.body.includes("Next.js Error") ||
      adminPageRes.body.includes("Unhandled Runtime Error") ||
      adminPageRes.body.includes("Syntax Error") ||
      adminPageRes.body.includes("Failed to compile");
    assert(!hasAdminErrorOverlay, "Page /admin renders cleanly with NO build/syntax error overlays");

    // 8c. Check static JS/CSS assets
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
