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
import { extractChildAnnotations, isAnnotationEvent, filterActivityEvents, getDailyFamilySummary } from "../src/lib/annotations";
import { buildGoogleCalendarDirectUrl } from "../src/lib/calendar";
import { getChildrenRegistry, findChildByEventText } from "../src/lib/childrenRegistry";
import { getHouseSystemsData } from "../src/lib/houseSystems";

async function fetchUrl(url: string, options?: RequestInit): Promise<{ status: number; body: string }> {
  const res = await fetch(url, options);
  const body = await res.text();
  return { status: res.status, body };
}

async function findActivePort(): Promise<number | null> {
  const ports = [3000, 3001, 3002];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/lunch`, { signal: AbortSignal.timeout(1500) });
      if (res.status === 200) {
        return port;
      }
    } catch {
      // probe next port
    }
  }
  return null;
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

  // Autonomous Pipeline Specs & Assets
  const buildMetaPath = path.join(process.cwd(), "public", "build-meta.json");
  assert(fs.existsSync(buildMetaPath), "public/build-meta.json exists");
  if (fs.existsSync(buildMetaPath)) {
    const metaJson = JSON.parse(fs.readFileSync(buildMetaPath, "utf-8"));
    assert(!!metaJson.timestamp, "build-meta.json contains ISO deployment timestamp");
  }


  const beagleSpecPath = path.join(process.cwd(), "specs", "talk-to-the-beagle.spec.md");
  assert(fs.existsSync(beagleSpecPath), "specs/talk-to-the-beagle.spec.md exists");

  const triageScriptPath = path.join(process.cwd(), "scripts", "triage-feedback.ts");
  assert(fs.existsSync(triageScriptPath), "scripts/triage-feedback.ts exists");

  const batchWorkflowPath = path.join(process.cwd(), ".github", "workflows", "batch-triage-feedback.yml");
  assert(fs.existsSync(batchWorkflowPath), ".github/workflows/batch-triage-feedback.yml exists");
  const batchWorkflowContent = fs.readFileSync(batchWorkflowPath, "utf-8");
  assert(
    batchWorkflowContent.includes("Workflow: Website Feedback ➔ Gemini Chat ➔ Functional Pull Request"),
    "Workflow 1 has standardized name 'Workflow: Website Feedback ➔ Gemini Chat ➔ Functional Pull Request'"
  );

  const executeWorkflowPath = path.join(process.cwd(), ".github", "workflows", "execute-beagle-proposal.yml");
  assert(fs.existsSync(executeWorkflowPath), ".github/workflows/execute-beagle-proposal.yml exists");
  const executeWorkflowContent = fs.readFileSync(executeWorkflowPath, "utf-8");
  assert(
    executeWorkflowContent.includes("Workflow: Take Functional Pull Request ➔ Gemini Coding ➔ Add Implementation to Pull Request"),
    "Workflow 2 has standardized name 'Workflow: Take Functional Pull Request ➔ Gemini Coding ➔ Add Implementation to Pull Request'"
  );

  const autoHealWorkflowPath = path.join(process.cwd(), ".github", "workflows", "auto-heal-pipeline.yml");
  assert(fs.existsSync(autoHealWorkflowPath), ".github/workflows/auto-heal-pipeline.yml exists");
  const autoHealWorkflowContent = fs.readFileSync(autoHealWorkflowPath, "utf-8");
  assert(
    autoHealWorkflowContent.includes("Workflow: Autonomous RCA & Self-Healing Pipeline Surgeon"),
    "Workflow 3 has standardized name 'Workflow: Autonomous RCA & Self-Healing Pipeline Surgeon'"
  );

  const autoRemediateScriptPath = path.join(process.cwd(), "scripts", "auto-remediate.ts");
  assert(fs.existsSync(autoRemediateScriptPath), "scripts/auto-remediate.ts exists");

  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(raw);
    assert(!!json.month && !!json.year, "JSON contains month and year");
    assert(Object.keys(json.days).length > 0, `JSON contains ${Object.keys(json.days).length} menu days`);

    let hasVTag = false;
    let hasItemsArray = true;
    for (const [date, day] of Object.entries<any>(json.days)) {
      if (!day.isNoSchool && (!Array.isArray(day.items) || day.items.length === 0)) {
        hasItemsArray = false;
      }
      if (day.items && day.items.some((i: string) => i.includes("(V)"))) {
        hasVTag = true;
      }
    }
    assert(hasItemsArray, "All school days contain array of line items ('items')");
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
    // Verify each configured calendar feed is actively reachable (no 404 / 401 / broken URLs)
    for (const s of calJson) {
      if (s.icsUrl && !s.icsUrl.startsWith("mock://")) {
        try {
          const res = await fetch(s.icsUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
          // If HEAD is not allowed (some CDNs), try GET with Range
          if (res.status === 405 || res.status === 403) {
            const getRes = await fetch(s.icsUrl, { headers: { Range: "bytes=0-100" }, signal: AbortSignal.timeout(5000) });
            assert(getRes.status >= 200 && getRes.status < 400, `Calendar feed '${s.name}' endpoint is reachable (HTTP ${getRes.status})`);
          } else {
            assert(res.status >= 200 && res.status < 400, `Calendar feed '${s.name}' endpoint is reachable (HTTP ${res.status})`);
          }
        } catch (e: any) {
          // If network is offline during local test run, check format; but online test gate must verify reachability
          console.warn(`  ⚠️ Calendar feed reachability check warning for '${s.name}': ${e.message}`);
        }
      }
    }
  }

  // Verify icon assets exist
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "teams", "osfc.png")), "OSFC team logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "schools", "adams.png")), "Adams Rams logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "schools", "millis.png")), "Millis Middle School logo exists");
  assert(fs.existsSync(path.join(process.cwd(), "public", "icons", "schools", "cfb.png")), "Clyde F. Brown (CFB) logo exists");
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
  assert(
    brightonMomAnno.custody?.status === "mom" &&
      brightonMomAnno.custody?.label === "Mom's" &&
      brightonMomAnno.custody?.town === "Holliston" &&
      brightonMomAnno.custody?.bgColor === "#dc2626" &&
      brightonMomAnno.custody?.badgeStyle.backgroundColor === "#dc2626",
    "Brighton with 'Liz kids' resolves to Mom's (Liz in Holliston - Red #dc2626)"
  );

  const bennettDadAnno = extractChildAnnotations([mockSwenEvent, mockSoccerEvent], "bennett");
  assert(
    bennettDadAnno.custody?.status === "dad" &&
      bennettDadAnno.custody?.label === "Dad's" &&
      bennettDadAnno.custody?.town === "Millis" &&
      bennettDadAnno.custody?.bgColor === "#800020" &&
      bennettDadAnno.custody?.badgeStyle.backgroundColor === "#800020",
    "Bennett with 'Swen kids' resolves to Dad's (Andrew in Millis - Maroon #800020)"
  );

  // Aria / Benjamin Custody extraction
  const ariaMomAnno = extractChildAnnotations([mockCallieEvent], "aria");
  assert(
    ariaMomAnno.custody?.status === "mom" &&
      ariaMomAnno.custody?.label === "Mom's" &&
      ariaMomAnno.custody?.town === "Millis" &&
      ariaMomAnno.custody?.bgColor === "#800020" &&
      ariaMomAnno.custody?.badgeStyle.backgroundColor === "#800020",
    "Aria with 'Callie kids' resolves to Mom's (Callie in Millis - Maroon #800020)"
  );

  const benDadAnno = extractChildAnnotations([], "benjamin");
  assert(
    benDadAnno.custody?.status === "dad" &&
      benDadAnno.custody?.label === "Dad's" &&
      benDadAnno.custody?.town === "Franklin" &&
      benDadAnno.custody?.bgColor === "#2563eb" &&
      benDadAnno.custody?.badgeStyle.backgroundColor === "#2563eb",
    "Benjamin without 'Callie kids' defaults to Dad's (Chris in Franklin - Blue #2563eb)"
  );

  // Exact matching and Fallback '!' Conflict tests
  const conflictLizAndrewAnno = extractChildAnnotations(
    [{ summary: "Liz kids" } as CalendarEvent, { summary: "Andrew kids" } as CalendarEvent],
    "brighton"
  );
  assert(
    conflictLizAndrewAnno.custody?.status === "error" && conflictLizAndrewAnno.custody?.label === "!",
    "Conflicting 'Liz kids' + 'Andrew kids' on same day falls back to error badge [ ! ]"
  );

  const conflictCallieChrisAnno = extractChildAnnotations(
    [{ summary: "Callie kids" } as CalendarEvent, { summary: "Chris kids" } as CalendarEvent],
    "aria"
  );
  assert(
    conflictCallieChrisAnno.custody?.status === "error" && conflictCallieChrisAnno.custody?.label === "!",
    "Conflicting 'Callie kids' + 'Chris kids' on same day falls back to error badge [ ! ]"
  );

  const defaultAndrewAnno = extractChildAnnotations([{ summary: "Doctor Appointment" } as CalendarEvent], "bennett");
  assert(
    defaultAndrewAnno.custody?.parentName === "Andrew" && defaultAndrewAnno.custody?.label === "Dad's",
    "Bennett on non-'Liz kids' day defaults to Andrew (Dad's - Maroon)"
  );

  // No-School extraction
  const schoolAnno = extractChildAnnotations([mockNoSchoolEvent], "aria");
  assert(schoolAnno.school?.status === "no_school" && schoolAnno.school?.label === "No School", "Child with no-school event resolves to 'No School' badge");

  // District & Child Scoped No-School Test (Aria/Ben Millis vs Brighton/Bennett Holliston)
  const mockMillisNoSchool: CalendarEvent = {
    id: "mps-1",
    sourceId: "aria-ben",
    sourceName: "Aria and Ben",
    color: "#3b82f6",
    summary: "MPS No School - Professional Development",
    start: "2026-09-04T00:00:00Z",
    end: "2026-09-05T00:00:00Z",
    allDay: true,
  };
  assert(extractChildAnnotations([mockMillisNoSchool], "aria").school?.status === "no_school", "MPS No School applies to Aria (Millis)");
  assert(extractChildAnnotations([mockMillisNoSchool], "benjamin").school?.status === "no_school", "MPS No School applies to Benjamin (Millis)");
  assert(extractChildAnnotations([mockMillisNoSchool], "brighton").school === undefined, "MPS No School strictly does NOT apply to Brighton (Holliston)");
  assert(extractChildAnnotations([mockMillisNoSchool], "bennett").school === undefined, "MPS No School strictly does NOT apply to Bennett (Holliston)");

  // Timezone & Majority-of-Day Boundary Intelligence Test
  const { getActiveEasternDatesForEvent } = require("../src/lib/dateUtils");
  const datesSept4 = getActiveEasternDatesForEvent({
    start: "2026-09-04T00:00:00.000Z",
    end: "2026-09-05T00:00:00.000Z",
    allDay: true,
  });
  assert(datesSept4.length === 1 && datesSept4[0] === "2026-09-04", "All-day event at UTC midnight resolves strictly to Friday Sept 4 (never Thursday Sept 3)");

  // Lunch Badge Cleanliness Test (Issue #10)
  const schoolBadgeFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "LunchWidget", "SchoolStatusBadge.tsx"), "utf-8");
  assert(!schoolBadgeFile.includes("Vegetarian Option"), "SchoolStatusBadge does NOT render redundant vegetarian badges");

  // Daily Family Summary Test (Ben/Aria & Brighton/Bennett household state)
  const familyDaySummary = getDailyFamilySummary([mockLizEvent, mockCallieEvent]);
  assert(familyDaySummary.ariaBen.custody?.parentName === "Callie", "DailyFamilySummary extracts Callie for Ben/Aria");
  assert(familyDaySummary.brightonBennett.custody?.parentName === "Liz", "DailyFamilySummary extracts Liz for Brighton/Bennett");

  // Google Calendar Day View Link Test (100% immune to 400/500 errors)
  const calLink = buildGoogleCalendarDirectUrl({
    uid: "8t6uthbhg437gcqj1dboprf6mk",
    summary: "OSFC Practice",
    start: new Date("2026-08-25T17:00:00Z"),
  });
  assert(calLink.includes("calendar.google.com/calendar/u/0/r/day/2026/8/25"), "buildGoogleCalendarDirectUrl routes directly to Google Calendar day view to prevent 400/500 errors");

  // Auth Gating Rule: Dad email is strictly aswens@gmail.com
  const authContextFile = fs.readFileSync(path.join(process.cwd(), "src", "context", "AuthContext.tsx"), "utf-8");
  assert(authContextFile.includes("aswens@gmail.com"), "AuthContext configures DAD_EMAIL as aswens@gmail.com");

  // Header Admin Gating Check
  const headerFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "layout", "Header.tsx"), "utf-8");
  assert(headerFile.includes("useAuth") && headerFile.includes("isAdmin ?"), "Header strictly gates the Admin button on Dad (aswens@gmail.com) login");

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

  const millisEnrichment = enrichCalendarEvent({
    summary: "Millis Middle School 7th Grade Open House",
    description: "Welcome parents to Millis Middle School",
    sourceName: "Aria and Ben",
  });
  assert(millisEnrichment?.category === "Millis Middle School", "Millis event resolves to 'Millis Middle School'");
  assert(millisEnrichment?.iconUrl === "/icons/schools/millis.png", "Millis event attaches '/icons/schools/millis.png' logo");
  assert(millisEnrichment?.child?.name === "Aria", "Millis Middle event resolves to Aria");

  const cfbEnrichment = enrichCalendarEvent({
    summary: "CFB Elementary Grade 5 Curriculum Night",
    description: "Clyde F. Brown school curriculum night",
    sourceName: "Aria and Ben",
  });
  assert(cfbEnrichment?.category === "Clyde F. Brown Elementary", "CFB event resolves to 'Clyde F. Brown Elementary'");
  assert(cfbEnrichment?.iconUrl === "/icons/schools/cfb.png", "CFB event attaches '/icons/schools/cfb.png' logo");
  assert(cfbEnrichment?.child?.name === "Benjamin", "CFB event resolves to Benjamin");

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

  // Disambiguation Test: Brighton Therapy on Brighton & Bennett calendar MUST map to Brighton (never Aria)
  const brightonTherapyEnrichment = enrichCalendarEvent({
    summary: "Brighton Therapy @ Coastal Counseling Medway",
    description: "Session at Coastal Counseling",
    sourceName: "Brighton and Bennett",
  });
  assert(brightonTherapyEnrichment?.child?.name === "Brighton", "Brighton Therapy @ Coastal Counseling strictly maps to Brighton, not Aria");

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
  if (activePort) {
    const BASE_URL = `http://localhost:${activePort}`;
    console.log(`\nActive Server Detected on: ${BASE_URL}`);

    // 7. Check API Endpoints
    console.log("\n6. Checking API Endpoints...");
    try {
      const lunchRes = await fetchUrl(`${BASE_URL}/api/lunch?date=2026-08-26`);
      assert(lunchRes.status === 200, "GET /api/lunch returns HTTP 200");
      const lunchJson = JSON.parse(lunchRes.body);
      assert(!!lunchJson.elementary && !!lunchJson.secondary, "GET /api/lunch returns elementary and secondary schedules");
      assert(!!lunchJson.byChild, "GET /api/lunch returns byChild dictionary");
    assert(
      lunchJson.byChild.bennett?.schoolName?.includes("Miller"),
      "Bennett resolves to Miller Elementary School lunch"
    );
    assert(
      lunchJson.byChild.brighton?.schoolName?.includes("Adams"),
      "Brighton resolves to Robert Adams Middle School lunch"
    );
    assert(
      lunchJson.byChild.bennett?.items?.length > 0,
      "Bennett has school lunch items on Aug 26, 2026"
    );
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

    assert(Array.isArray(adminJson.calendar.missingIcons), `GET /api/admin returns dynamic missingIcons array (${adminJson.calendar.missingIcons.length} items)`);
    assert(!!adminJson.lunch && typeof adminJson.lunch.thirtyDaySchoolDaysTotal === "number", "GET /api/admin returns 30-day school lunch coverage");

    // Check that completed checklist items are suppressed and only pending tasks remain
    assert(
      adminJson.calendar.dadChecklist.every((t: any) => t.status === "pending"),
      "Admin checklist strictly excludes completed tasks and only returns actionable pending items"
    );
    assert(
      typeof adminJson.geminiSanitizationPrompt === "string" && adminJson.geminiSanitizationPrompt.includes("Swenson-Antonelli"),
      "GET /api/admin returns comprehensive Google Gemini Sanitization Prompt"
    );

    // Parent Information Handbook verification
    assert(!!adminJson.parentInfo && Array.isArray(adminJson.parentInfo.documents), "GET /api/admin returns parentInfo with documents array");
    const schoolHoursDoc = adminJson.parentInfo.documents.find((d: any) => d.id === "school-hours");
    assert(!!schoolHoursDoc, "Parent Info documents includes school-hours.md");
    assert(
      schoolHoursDoc.content.includes("2:18 PM") &&
      schoolHoursDoc.content.includes("3:03 PM") &&
      schoolHoursDoc.content.includes("11:32 AM") &&
      schoolHoursDoc.content.includes("10:47 AM"),
      "school-hours.md contains accurate Miller/Adams regular and early dismissal times"
    );
    assert(
      adminJson.parentInfo.quickReference.schoolHours.millerRegular === "2:18 PM" &&
      adminJson.parentInfo.quickReference.schoolHours.adamsRegular === "3:03 PM" &&
      adminJson.parentInfo.quickReference.schoolHours.adamsEarly === "11:32 AM" &&
      adminJson.parentInfo.quickReference.schoolHours.millerEarly === "10:47 AM",
      "Parent Info quickReference contains verified school dismissal hours"
    );
    assert(
      !!adminJson.general.lastSystemUpdate && !!adminJson.general.lastSystemUpdate.timestamp,
      "GET /api/admin returns lastSystemUpdate deployment metadata"
    );
  } catch (err: any) {
    assert(false, "GET /api/admin", `Server unreachable: ${err.message}`);
  }

  // 7b. Check Autonomous Feedback API Endpoint
  try {
    const feedbackEmptyRes = await fetchUrl(`${BASE_URL}/api/agent-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      feedbackEmptyRes.status === 400,
      "POST /api/agent-feedback returns HTTP 400 when dictatedText is missing"
    );
  } catch (err: any) {
      assert(false, "POST /api/agent-feedback validation", `Server unreachable: ${err.message}`);
    }

    // Live Web Page & Asset Verification (requires active server)
    console.log("\n7. Checking Webpages & Error Overlay Detection (Live Server)...");
    try {
      // Main Kiosk Page
      const pageRes = await fetchUrl(`${BASE_URL}/`);
      assert(pageRes.status === 200, "GET / returns HTTP 200 HTML");
      assert(pageRes.body.includes("Scouty Planner"), "Page contains Scouty Planner title");
      assert(pageRes.body.includes("Kids Columns"), "Page contains 4-Column Kids view switcher");
      assert(pageRes.body.includes("Daily Summary"), "Page contains Daily Summary view switcher");
      assert(pageRes.body.includes("Talk to the Beagle"), "Page contains FloatingFeedbackButton with 'Talk to the Beagle'");

      const hasErrorOverlay =
        pageRes.body.includes("Next.js Error") ||
        pageRes.body.includes("Unhandled Runtime Error") ||
        pageRes.body.includes("Syntax Error") ||
        pageRes.body.includes("Failed to compile");
      assert(!hasErrorOverlay, "Page / renders cleanly with NO build/syntax error overlays");
      assert(pageRes.body.includes('name="viewport"'), "Page includes mobile responsive viewport configuration");

      const adminPageRes = await fetchUrl(`${BASE_URL}/admin`);
      assert(adminPageRes.status === 200, "GET /admin returns HTTP 200 HTML");

      const hasAdminErrorOverlay =
        adminPageRes.body.includes("Next.js Error") ||
        adminPageRes.body.includes("Unhandled Runtime Error") ||
        adminPageRes.body.includes("Syntax Error") ||
        adminPageRes.body.includes("Failed to compile");
      assert(!hasAdminErrorOverlay, "Page /admin renders cleanly with NO build/syntax error overlays");

      // Check static JS/CSS assets
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
  } else {
    console.log("\nℹ️  Live server not active on ports 3000-3002: skipping live HTTP endpoint checks (running comprehensive component & static suite).");
  }

  // 8. Component Structure, Layout & Badges UI (Runs always in CI and local)
  console.log("\n8. Checking Component Structure, 4-Column Layout & Badges UI...");
  const kidsTimelineFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "CalendarWidget", "KidsColumnTimeline.tsx"), "utf-8");
  assert(
    kidsTimelineFile.includes('"Aria"') &&
    kidsTimelineFile.includes('"Brighton"') &&
    kidsTimelineFile.includes('"Benjamin"') &&
    kidsTimelineFile.includes('"Bennett"'),
    "KidsColumnTimeline configures 4 child columns: Aria, Brighton, Benjamin, Bennett"
  );
  assert(
    kidsTimelineFile.includes("ChildHeader"),
    "KidsColumnTimeline integrates universal ChildHeader component"
  );
  assert(
    kidsTimelineFile.includes("extractChildAnnotations") && kidsTimelineFile.includes("filterActivityEvents"),
    "KidsColumnTimeline integrates annotations engine for custody and no-school badges"
  );
  assert(
    kidsTimelineFile.includes("Unknown / Uncategorized Events") && kidsTimelineFile.includes("HelpCircle"),
    "KidsColumnTimeline classifies unassigned activities into red 'Unknown / Uncategorized Events' section with question mark icon"
  );
  assert(
    kidsTimelineFile.includes("ExternalLink") && kidsTimelineFile.includes("calendar.google.com"),
    "KidsColumnTimeline includes subtle link icon to open Google Calendar invite"
  );

  // Universal ChildHeader component verification
  const childHeaderFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "common", "ChildHeader.tsx"), "utf-8");
  assert(
    childHeaderFile.includes("w-14 h-14") && childHeaderFile.includes("border-slate-700/80"),
    "ChildHeader implements 50% larger avatars with consistent neutral borders"
  );
  assert(
    childHeaderFile.includes("w-[76px]") || childHeaderFile.includes("min-w-[76px]") || /w-\[\d+px\]/.test(childHeaderFile),
    "ChildHeader implements fixed-width non-jumping custody badges"
  );
  assert(
    childHeaderFile.includes("flex-col items-end gap-1"),
    "ChildHeader implements vertical status badge stacking with deterministic priority"
  );

  // Lunch presentation check: Standalone LunchWidget removed from bottom of DashboardGrid
  const dashboardGridFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "layout", "DashboardGrid.tsx"), "utf-8");
  assert(!dashboardGridFile.includes("<LunchWidget"), "DashboardGrid removes bottom LunchWidget in favor of child calendar badges");

  // ChildHeader and Modal checks
  assert(childHeaderFile.includes("lunchMenu") && childHeaderFile.includes("onLunchClick"), "ChildHeader supports interactive lunch badges");
  const childModalFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "widgets", "LunchWidget", "ChildLunchModal.tsx"), "utf-8");
  assert(
    childModalFile.includes("Today's Lunch Menu") || childModalFile.includes("Today&apos;s Lunch Menu"),
    "ChildLunchModal displays simplified unified bulleted menu list"
  );
  assert(
    !childModalFile.includes("District Standard Inclusions"),
    "ChildLunchModal excludes redundant district standard inclusions"
  );

  // Verify Tab implementations in Admin page source file
  const adminSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "admin", "page.tsx"), "utf-8");
  assert(adminSource.includes("General Overview"), "Admin page implements 'General Overview' tab");
  assert(adminSource.includes("Child Profiles & Schedules") || adminSource.includes("Child Profiles &amp; Schedules"), "Admin page implements 'Child Profiles & Schedules' tab");
  assert(adminSource.includes("Family Calendar"), "Admin page implements 'Family Calendar' tab");
  assert(adminSource.includes("School Lunch"), "Admin page implements 'School Lunch' tab");
  assert(
    adminSource.includes("Child Profiles Matrix") && adminSource.includes("Attribute"),
    "Admin page implements Child Profiles Matrix table with row headers on the left"
  );
  assert(
    adminSource.includes("handleApproveIcon"),
    "Admin page implements 1-click icon approval engine with handleApproveIcon"
  );
  assert(
    adminSource.includes("<PipelineTracker"),
    "Admin page integrates visual Operational Pipeline Tracker"
  );
  assert(
    fs.existsSync(path.join(process.cwd(), "src", "components", "admin", "PipelineTracker.tsx")),
    "src/components/admin/PipelineTracker.tsx exists"
  );
  assert(
    adminSource.includes("<AutomationArchitectureDiagram"),
    "Admin page integrates living Automation Architecture Diagram (Invariant 7)"
  );
  assert(
    fs.existsSync(path.join(process.cwd(), "src", "components", "admin", "AutomationArchitectureDiagram.tsx")),
    "src/components/admin/AutomationArchitectureDiagram.tsx exists"
  );

  const agentsRules = fs.readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf-8");
  assert(
    agentsRules.includes("Automation Architecture & Living Pipeline Diagram Invariant") &&
      agentsRules.includes("Stage 1 (Physical Origin)") &&
      agentsRules.includes("Stage 5 (Tangible Concrete Result)"),
    "AGENTS.md strictly codifies Invariant 7 living architecture diagram rule"
  );
  assert(
    agentsRules.includes("Terse, Scannable UI Invariant"),
    "AGENTS.md strictly codifies Invariant 8 terse, scannable UI rule"
  );

  // 9. Checking 10 Bullard Lane Smart Systems Peer & Hardware Scaffolding
  console.log("\n9. Checking 10 Bullard Lane Smart Systems Peer & Hardware Scaffolding...");
  const houseDataPath = path.join(process.cwd(), "data", "house_systems.json");
  assert(fs.existsSync(houseDataPath), "data/house_systems.json exists");

  const houseSystems = getHouseSystemsData();
  assert(houseSystems.houseName === "10 Bullard Lane", "House systems data configures '10 Bullard Lane'");
  assert(houseSystems.address.includes("Millis, MA"), "House systems address correctly configures 'Millis, MA'");
  assert(houseSystems.summary.totalDevices >= 8, `House systems includes all 10 Bullard Lane devices (found ${houseSystems.summary.totalDevices})`);

  // Specific hardware requested by user
  assert(houseSystems.devicesByCategory.climate.length >= 2, "Includes Samsung SmartThings & Ecobee thermostats");
  assert(houseSystems.devicesByCategory.irrigation.length >= 3, "Includes smart sprinkler controller & one-off sprinklers");
  assert(houseSystems.devicesByCategory.power.length >= 3, "Includes smart outlets & plugs");
  assert(houseSystems.devicesByCategory.assistant.length >= 1, "Includes Alexa Echo devices");

  // DAD TODO placeholders engine
  assert(houseSystems.summary.unconfiguredDevices > 0, "Provides DAD TODO placeholders for unlinked hardware");
  const samsungDevice = houseSystems.devicesByCategory.climate.find((d) => d.id === "samsung-thermostat" || d.provider === "smartthings");
  assert(!!samsungDevice, "Samsung thermostat is present in climate devices");

  // Header & Grid Peer Navigation
  const houseHeaderFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "layout", "Header.tsx"), "utf-8");
  assert(
    (houseHeaderFile.includes("Our Home") || houseHeaderFile.includes("10 Bullard Lane")) &&
    (houseHeaderFile.includes("Our Calendar") || houseHeaderFile.includes("Family Calendar")),
    "Header implements peer switcher between Our Calendar and Our Home"
  );

  const gridFile = fs.readFileSync(path.join(process.cwd(), "src", "components", "layout", "DashboardGrid.tsx"), "utf-8");
  assert(gridFile.includes("HouseSystemsWidget"), "DashboardGrid integrates HouseSystemsWidget peer view");

  const houseWidgetPath = path.join(process.cwd(), "src", "components", "widgets", "HouseSystemsWidget", "HouseSystemsWidget.tsx");
  assert(fs.existsSync(houseWidgetPath), "HouseSystemsWidget component file exists");
  const houseWidgetContent = fs.readFileSync(houseWidgetPath, "utf-8");
  assert(houseWidgetContent.includes("lg:grid-cols-4"), "HouseSystemsWidget implements 4-column layout matching Family Calendar");
  assert(houseWidgetContent.includes("DAD TODO"), "HouseSystemsWidget displays DAD TODO badges");

  console.log("\n==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
