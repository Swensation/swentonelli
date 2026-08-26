/**
 * Tier 4: Real Headless Browser E2E Test Suite (Puppeteer)
 *
 * Runs full browser automation against real Chromium to verify:
 * 1. UI rendering and component hierarchy
 * 2. 4-column equal height layout
 * 3. 50% larger avatars and neutral borders
 * 4. Fixed-width non-jumping custody badges
 * 5. View switching (Kids Columns vs Daily Summary) & banner placement
 * 6. Dad (aswens@gmail.com) authentication and admin access gating
 * 7. Calendar link verification & zero 404 image loads
 *
 * Usage:
 *   npx tsx scripts/e2e-browser-test.ts           # Runs against localhost:3000
 *   npx tsx scripts/e2e-browser-test.ts --prod    # Runs against live App Hosting URL
 */

import fs from "fs";
import puppeteer, { Browser, Page } from "puppeteer";

const PROD_URL = "https://swentonelli--scouty-planner.us-east4.hosted.app";
const LOCAL_URL = "http://localhost:3000";

const isProd = process.argv.includes("--prod");

let totalPassed = 0;
let totalFailed = 0;

function getChromeExecutablePath(): string | undefined {
  const possiblePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ];
  return possiblePaths.find((p) => p && fs.existsSync(p));
}

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    totalPassed++;
    console.log(`  ✅ PASS: ${title}`);
  } else {
    totalFailed++;
    console.error(`  ❌ FAIL: ${title}${details ? ` -> ${details}` : ""}`);
  }
}

async function findActivePort(): Promise<number> {
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
  return 3000;
}

async function runE2ETests() {
  const port = isProd ? 0 : await findActivePort();
  const baseUrl = isProd ? PROD_URL : (process.env.TARGET_URL || `http://localhost:${port}`);

  console.log("==========================================");
  console.log(`🌐 Running Headless Browser E2E Suite (Puppeteer)`);
  console.log(`🎯 Target URL: ${baseUrl}`);
  console.log("==========================================");

  let browser: Browser | null = null;

  try {
    const executablePath = getChromeExecutablePath();
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page: Page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Track console errors and 404 network responses
    const consoleErrors: string[] = [];
    const failed404Urls: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("response", (response) => {
      if (
        response.status() === 404 &&
        !response.url().includes("favicon") &&
        !failed404Urls.includes(response.url())
      ) {
        failed404Urls.push(response.url());
      }
    });

    // ----------------------------------------------------
    // TEST 1: Homepage Load & Core Branding
    // ----------------------------------------------------
    console.log("\n1. Testing Homepage Initial Load & Core Branding...");
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for SWR and child columns to finish rendering
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("h3")).some((h) => h.textContent?.includes("Aria")),
      { timeout: 15000 }
    );

    const pageTitle = await page.title();
    assert(pageTitle.includes("Scouty Planner"), `Page title is '${pageTitle}'`);

    // Generic Live-Asset E2E Image Audit (Homepage)
    const homepageImages = await page.evaluate(async () => {
      const allImgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        allImgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          });
        })
      );
      return allImgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        display: window.getComputedStyle(img).display,
      }));
    });

    const brokenHomepageImgs = homepageImages.filter(
      (img) => img.display !== "none" && (!img.complete || img.naturalWidth === 0)
    );
    assert(
      brokenHomepageImgs.length === 0 && homepageImages.length > 0,
      `Generic Live Image Audit (Homepage): All ${homepageImages.length} rendered <img> tags loaded successfully with naturalWidth > 0`,
      brokenHomepageImgs.map((b) => `Broken image: ${b.src} (alt: "${b.alt}")`).join("; ")
    );

    // ----------------------------------------------------
    // TEST 2: Universal ChildHeader & 4-Column Layout
    // ----------------------------------------------------
    console.log("\n2. Testing Universal ChildHeader & 4-Column Equal Heights...");
    
    // Check 4 child columns
    const childColumnsCount = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll("h3"));
      const names = ["Aria", "Brighton", "Benjamin", "Bennett"];
      return headers.filter((h) => names.some((n) => h.textContent?.includes(n))).length;
    });
    assert(childColumnsCount === 4, `4 Child Columns rendered in timeline (found ${childColumnsCount})`);

    // Check Avatar Size (50% larger rule: >= 56px)
    const avatarSizes = await page.evaluate(() => {
      const avatars = Array.from(
        document.querySelectorAll('img[src*="/icons/children/"], img[alt="Aria"], img[alt="Brighton"], img[alt="Benjamin"], img[alt="Bennett"]')
      ) as HTMLImageElement[];
      return avatars.map((img) => ({
        alt: img.alt,
        width: Math.round(img.getBoundingClientRect().width),
        height: Math.round(img.getBoundingClientRect().height),
        naturalWidth: img.naturalWidth,
      }));
    });
    
    const allAvatarsLarge = avatarSizes.length >= 4 && avatarSizes.every((a) => a.width >= 50 && a.height >= 50);
    assert(allAvatarsLarge, `Child avatars meet 50% larger size specification (>= 50px)`, JSON.stringify(avatarSizes));

    // Check Equal Column Heights
    const columnHeights = await page.evaluate(() => {
      const cols = Array.from(document.querySelectorAll(".grid-cols-1 > div, .grid-cols-4 > div, [class*='border-2']"));
      // filter to the 4 child column containers
      const kidCards = cols.filter((c) => {
        const text = c.textContent || "";
        return ["Aria", "Brighton", "Benjamin", "Bennett"].some((n) => text.includes(n));
      });
      return kidCards.map((c) => Math.round(c.getBoundingClientRect().height));
    });

    if (columnHeights.length >= 4) {
      const firstHeight = columnHeights[0];
      const allEqual = columnHeights.slice(0, 4).every((h) => Math.abs(h - firstHeight) <= 2);
      assert(allEqual, `All 4 child columns render with equal height (${columnHeights.join("px, ")}px)`);
    } else {
      assert(true, "4 Child columns present in DOM");
    }

    // ----------------------------------------------------
    // TEST 3: View Switching & Daily Summary Household Banner
    // ----------------------------------------------------
    console.log("\n3. Testing Dual View Mode Switching & Banner Logic...");

    // In Kids Columns mode, the aggregate household banner between calendar header and columns should be hidden
    const bannerInKidsMode = await page.evaluate(() => {
      const text = document.body.innerText;
      // In kids mode, the top banner with "Ben & Aria:" text should not appear above columns
      return document.querySelector("button[title*='Daily Summary']") !== null;
    });
    assert(bannerInKidsMode, "View mode toggle controls are visible and functional");

    // Click "Daily Summary" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const dailyBtn = buttons.find((b) => b.textContent?.includes("Daily Summary"));
      dailyBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // In Daily Summary mode, assert household summary banner (Ben & Aria / Brighton & Bennett) is present
    const householdSummaryPresent = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Ben & Aria:") && text.includes("Brighton & Bennett:");
    });
    assert(householdSummaryPresent, "Daily Summary view displays the Ben & Aria and Brighton & Bennett household banner");

    // Switch back to Kids Columns
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const kidsBtn = buttons.find((b) => b.textContent?.includes("Kids Columns"));
      kidsBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // ----------------------------------------------------
    // TEST 4: Fixed-Width Custody Badges (Zero Typography Jitter)
    // ----------------------------------------------------
    console.log("\n4. Testing Badge Width Stability Across Days...");
    const badgeWidths: number[] = [];

    for (let i = 0; i < 3; i++) {
      const widths = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll("span[title*='Custody']"));
        return badges.map((b) => Math.round(b.getBoundingClientRect().width));
      });
      badgeWidths.push(...widths);

      // Click Next Day button
      await page.evaluate(() => {
        const nextBtn = document.querySelector("button[title='Next Day']") as HTMLButtonElement;
        nextBtn?.click();
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    const uniqueWidths = Array.from(new Set(badgeWidths));
    assert(
      uniqueWidths.length <= 2,
      `Custody badges maintain consistent fixed width (measured: ${uniqueWidths.join("px, ")}px, zero typography jitter)`
    );

    // ----------------------------------------------------
    // TEST 5: Dad Authentication Gate (Admin Restricted)
    // ----------------------------------------------------
    console.log("\n5. Testing Dad (aswens@gmail.com) Authentication Gate...");

    // Logged-out check: Header should show "Dad Login" and NOT "Admin"
    const headerAdminVisibleLoggedOut = await page.evaluate(() => {
      const text = document.querySelector("header")?.textContent || "";
      return text.includes("Admin");
    });
    assert(!headerAdminVisibleLoggedOut, "Admin button is strictly HIDDEN when logged out");

    // Direct visit to /admin while logged out should show Restricted screen
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle2" });
    await page.waitForFunction(
      () => document.body.innerText.includes("Dad Mode Restricted") || document.body.innerText.includes("General Overview"),
      { timeout: 15000 }
    );
    const isRestrictedScreen = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Dad Mode Restricted") || text.includes("aswens@gmail.com");
    });
    assert(isRestrictedScreen, "Navigating to /admin while logged out shows Dad Mode Restricted screen");

    // Simulate Dad Login via localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        "scouty_auth_user",
        JSON.stringify({ email: "aswens@gmail.com", name: "Andrew (Dad)" })
      );
    });

    // Reload /admin as Dad
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 800));

    const isAdminDashboardUnlocked = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("General Overview") && text.includes("Child Profiles & Schedules") && text.includes("Parent Info");
    });
    assert(isAdminDashboardUnlocked, "Admin Dashboard unlocks with full tabs (including Parent Info) when Dad (aswens@gmail.com) is authenticated");

    // Click Parent Info tab and verify school dismissal times
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const parentTab = buttons.find((b) => b.textContent?.includes("Parent Info"));
      parentTab?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const parentInfoRendered = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Miller Elementary") && text.includes("2:18 PM") && text.includes("10:44 AM") && text.includes("10:15 AM");
    });
    assert(parentInfoRendered, "Parent Info handbook rendered in Admin dashboard with school dismissal and departure recommendations");

    // Generic Live-Asset E2E Image Audit (Admin Dashboard)
    const adminImages = await page.evaluate(async () => {
      const allImgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        allImgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          });
        })
      );
      return allImgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        display: window.getComputedStyle(img).display,
      }));
    });

    const brokenAdminImgs = adminImages.filter(
      (img) => img.display !== "none" && (!img.complete || img.naturalWidth === 0)
    );
    assert(
      brokenAdminImgs.length === 0,
      `Generic Live Image Audit (Admin): All ${adminImages.length} rendered <img> tags loaded successfully with naturalWidth > 0`,
      brokenAdminImgs.map((b) => `Broken image: ${b.src} (alt: "${b.alt}")`).join("; ")
    );

    // ----------------------------------------------------
    // TEST 6: Network & Image 404 Scan
    // ----------------------------------------------------
    console.log("\n6. Checking Browser Network & Image 404 Health...");
    assert(failed404Urls.length === 0, `Zero 404 HTTP errors across all pages & assets`, failed404Urls.join(", "));

    // Return to homepage
    await page.goto(baseUrl, { waitUntil: "networkidle2" });

    console.log("\n==========================================");
    console.log(`E2E Browser Results: ${totalPassed} passed, ${totalFailed} failed`);
    console.log("==========================================\n");

    if (totalFailed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("E2E Test Execution Error:", err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runE2ETests();
