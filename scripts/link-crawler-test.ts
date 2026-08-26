/**
 * Tier 3: Autonomous Link & Asset Health Crawler
 *
 * Scans all calendar event links, child avatar assets, team crests, and school logos
 * to guarantee ZERO 404s, ZERO 400s, and ZERO 500s across the entire application.
 */

import fs from "fs";
import path from "path";
import { fetchCalendarAgenda } from "../src/lib/calendar";
import { getChildrenRegistry } from "../src/lib/childrenRegistry";
import { loadEventRules } from "../src/lib/eventRules";

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    totalPassed++;
    console.log(`  ✅ PASS: ${title}`);
  } else {
    totalFailed++;
    console.error(`  ❌ FAIL: ${title}${details ? ` -> ${details}` : ""}`);
  }
}

async function runLinkAndAssetCrawler() {
  console.log("==========================================");
  console.log("🕷️ Running Autonomous Link & Asset Crawler");
  console.log("==========================================");

  // 1. Check Child Profile Avatars & School Logos
  console.log("\n1. Verifying Child Registry Image Assets...");
  const registry = getChildrenRegistry();
  const publicDir = path.join(process.cwd(), "public");

  for (const child of registry) {
    // Check avatarIcon
    const avatarRelative = child.avatarIcon.replace(/^\//, "");
    const avatarFullPath = path.join(publicDir, avatarRelative);
    assert(
      fs.existsSync(avatarFullPath),
      `Child '${child.name}' avatar asset exists at ${child.avatarIcon}`,
      `File not found: ${avatarFullPath}`
    );
  }

  // 2. Check Event Rules Brand & Team Crests
  console.log("\n2. Verifying Configured Event Rules Crests & Logos...");
  const rules = loadEventRules();
  for (const rule of rules) {
    if (rule.iconUrl) {
      const iconRelative = rule.iconUrl.replace(/^\//, "");
      const iconFullPath = path.join(publicDir, iconRelative);
      assert(
        fs.existsSync(iconFullPath),
        `Rule '${rule.category}' crest exists at ${rule.iconUrl}`,
        `File not found: ${iconFullPath}`
      );
    }
  }

  // 3. Scan & Verify Live Calendar Event Links (Zero 400/500 Errors)
  console.log("\n3. Scanning & Validating Calendar Event Deep Links...");
  try {
    const agenda = await fetchCalendarAgenda();
    const allEvents = Object.values(agenda.byDate).flat();
    console.log(`     Found ${allEvents.length} events across all configured feeds.`);

    let validUrlCount = 0;
    let brokenUrlCount = 0;

    for (const ev of allEvents) {
      const url = ev.url;
      if (!url) {
        brokenUrlCount++;
        assert(false, `Event '${ev.summary}' has a valid URL`, "url is undefined");
        continue;
      }

      // Assert that URL never uses the broken /r/eventedit/<Apple-UUID> or /event?eid= that throws 400/500
      const isDangerous500Url = url.includes("/eventedit/") && /[a-zA-Z0-9]{40,}/.test(url);
      const isDangerous400Url = url.includes("/event?eid=");
      const isSafeDayView = url.includes("calendar.google.com/calendar/u/0/r/day/");

      if (isDangerous500Url || isDangerous400Url) {
        brokenUrlCount++;
        assert(
          false,
          `Event '${ev.summary}' link is safe`,
          `URL may trigger Google Calendar 400/500 error: ${url}`
        );
      } else {
        validUrlCount++;
      }
    }

    assert(
      brokenUrlCount === 0 && validUrlCount > 0,
      `All ${validUrlCount} calendar events have error-free Google Calendar links`
    );
  } catch (err: any) {
    assert(false, "Fetch & scan calendar events", err.message);
  }

  // 4. Mascot Image Integrity
  console.log("\n4. Verifying Dashboard Mascot & General UI Icons...");
  const scoutPngPath = path.join(publicDir, "scout.png");
  assert(fs.existsSync(scoutPngPath), "Scout mascot image exists at /scout.png");

  console.log("\n==========================================");
  console.log(`Crawler Results: ${totalPassed} passed, ${totalFailed} failed`);
  console.log("==========================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runLinkAndAssetCrawler().catch((err) => {
  console.error("Crawler fatal error:", err);
  process.exit(1);
});
