/**
 * Generic Live-Asset E2E Test Suite
 *
 * Validates:
 * 1. Direct HTTP 200 responses for all static assets in public/
 * 2. Headless browser E2E test verifying every rendered <img> has naturalWidth > 0,
 *    complete === true, and zero 404 network responses across all application views.
 *
 * Usage:
 *   npx tsx scripts/test-live-assets.ts           # Runs against localhost
 *   npx tsx scripts/test-live-assets.ts --prod    # Runs against live App Hosting URL
 */

import fs from "fs";
import path from "path";
import puppeteer, { Browser, Page } from "puppeteer";

const PROD_URL = "https://swentonelli--scouty-planner.us-east4.hosted.app";
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

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join("/");
      files.push("/" + relPath);
    }
  }
  return files;
}

async function auditPageImages(page: Page, contextName: string, failed404Urls: string[]) {
  const imgs = await page.evaluate(async () => {
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

  const visibleImgs = imgs.filter((img) => img.display !== "none");
  console.log(`     Found ${visibleImgs.length} visible rendered images in ${contextName}.`);

  for (const img of visibleImgs) {
    const isLoaded = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    assert(
      isLoaded,
      `${contextName}: <img> [${img.alt || img.src}] rendered with natural dimensions (${img.naturalWidth}x${img.naturalHeight})`,
      `Broken src: ${img.src}, complete: ${img.complete}, naturalWidth: ${img.naturalWidth}`
    );
  }
}

async function runLiveAssetTests() {
  const port = isProd ? 0 : await findActivePort();
  const baseUrl = isProd ? PROD_URL : (process.env.TARGET_URL || `http://localhost:${port}`);

  console.log("==========================================");
  console.log(`🖼️  Generic Live-Asset E2E Test Suite`);
  console.log(`🎯 Target URL: ${baseUrl}`);
  console.log("==========================================");

  // 1. Direct HTTP 200 validation for all files in public/
  console.log("\n1. Direct HTTP validation for all files in public/ directory...");
  const publicDir = path.join(process.cwd(), "public");
  const allPublicAssets = getAllFiles(publicDir);

  console.log(`   Discovered ${allPublicAssets.length} static assets in public/ folder.`);
  for (const assetPath of allPublicAssets) {
    const target = `${baseUrl}${assetPath}`;
    try {
      const res = await fetch(target, { method: "GET" });
      const status = res.status;
      assert(status === 200, `Asset ${assetPath} returns HTTP 200`, `Status: ${status} at ${target}`);
    } catch (err: any) {
      assert(false, `Asset ${assetPath} reachable`, err.message);
    }
  }

  // 2. Headless Browser E2E validation: Rendered <img> tags on pages
  console.log("\n2. Browser E2E <img> naturalWidth & HTTP 200 validation...");
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

    const failed404Urls: string[] = [];
    page.on("response", (response) => {
      if (response.status() === 404 && !response.url().includes("favicon") && !failed404Urls.includes(response.url())) {
        failed404Urls.push(response.url());
      }
    });

    // View A: Homepage (Kids Column Mode)
    console.log(`\n   Navigating to Homepage (${baseUrl})...`);
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("h3")).some((h) => h.textContent?.includes("Aria")),
      { timeout: 15000 }
    );
    await auditPageImages(page, "Homepage (Kids Columns)", failed404Urls);

    // View B: Daily Summary Mode
    console.log(`\n   Switching to Daily Summary View...`);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const dailyBtn = buttons.find((b) => b.textContent?.includes("Daily Summary"));
      dailyBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await auditPageImages(page, "Homepage (Daily Summary)", failed404Urls);

    // View C: Admin Logged-Out Restricted Screen
    console.log(`\n   Navigating to ${baseUrl}/admin (Logged Out)...`);
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForFunction(
      () => document.body.innerText.includes("Dad Mode Restricted") || document.body.innerText.includes("General Overview"),
      { timeout: 15000 }
    );
    await auditPageImages(page, "Admin Restricted Screen", failed404Urls);

    // View D: Admin Authenticated Dashboard
    console.log(`\n   Authenticating as Dad and navigating to ${baseUrl}/admin...`);
    await page.evaluate(() => {
      localStorage.setItem(
        "scouty_auth_user",
        JSON.stringify({ email: "aswens@gmail.com", name: "Andrew (Dad)" })
      );
    });
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForFunction(
      () => document.body.innerText.includes("General Overview"),
      { timeout: 15000 }
    );
    await new Promise((r) => setTimeout(r, 800));
    await auditPageImages(page, "Admin Dashboard (Overview)", failed404Urls);

    // View E: Admin Child Profiles & Schedules Tab
    console.log(`\n   Opening Admin Child Profiles & Schedules Tab...`);
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button"));
      const profilesTab = tabs.find((b) => b.textContent?.includes("Child Profiles"));
      profilesTab?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await auditPageImages(page, "Admin Dashboard (Child Profiles)", failed404Urls);

    // View F: Admin Rules & Badges Tab
    console.log(`\n   Opening Admin Rules & Badges Tab...`);
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button"));
      const rulesTab = tabs.find((b) => b.textContent?.includes("Event Rules"));
      rulesTab?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await auditPageImages(page, "Admin Dashboard (Rules & Badges)", failed404Urls);

    // Assert zero 404 network responses detected across all visited views
    console.log("\n3. Verifying Zero 404 HTTP Responses across entire session...");
    assert(failed404Urls.length === 0, "Zero 404 network responses detected across all pages", failed404Urls.join(", "));

    console.log("\n==========================================");
    console.log(`Live Asset Results: ${totalPassed} passed, ${totalFailed} failed`);
    console.log("==========================================\n");

    if (totalFailed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Live Asset Test Execution Error:", err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runLiveAssetTests();
