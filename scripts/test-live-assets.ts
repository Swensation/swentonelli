import fs from "fs";
import path from "path";
import puppeteer, { Browser, Page } from "puppeteer";

const PROD_URL = "https://swentonelli--scouty-planner.us-east4.hosted.app";
const LOCAL_URL = "http://localhost:3000";

const isProd = process.argv.includes("--prod");

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
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      files.push("/" + relPath);
    }
  }
  return files;
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

  for (const assetPath of allPublicAssets) {
    const target = `${baseUrl}${assetPath}`;
    try {
      const res = await fetch(target, { method: "HEAD" });
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

    // Test A: Homepage
    console.log(`\nNavigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for content
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("h3")).some((h) => h.textContent?.includes("Aria")),
      { timeout: 15000 }
    );

    const homeImgs = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          });
        })
      );
      return imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        display: window.getComputedStyle(img).display,
      }));
    });

    console.log(`Found ${homeImgs.length} images rendered on Homepage.`);
    const visibleHomeImgs = homeImgs.filter((img) => img.display !== "none");
    assert(visibleHomeImgs.length > 0, `Homepage renders at least 1 image (found ${visibleHomeImgs.length})`);
    for (const img of visibleHomeImgs) {
      assert(
        img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
        `Homepage img src="${img.src}" (alt="${img.alt}") loaded with natural dimensions (${img.naturalWidth}x${img.naturalHeight})`,
        `naturalWidth=${img.naturalWidth}`
      );
    }

    // Test B: Admin Logged-Out Restricted Screen
    console.log(`\nNavigating to ${baseUrl}/admin (Logged Out)...`);
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForFunction(
      () => document.body.innerText.includes("Dad Mode Restricted") || document.body.innerText.includes("General Overview"),
      { timeout: 15000 }
    );

    const restrictedImgs = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          });
        })
      );
      return imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        display: window.getComputedStyle(img).display,
      }));
    });

    console.log(`Found ${restrictedImgs.length} images on Admin Restricted Screen.`);
    for (const img of restrictedImgs.filter((i) => i.display !== "none")) {
      assert(
        img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
        `Admin Restricted img src="${img.src}" (alt="${img.alt}") loaded with natural dimensions (${img.naturalWidth}x${img.naturalHeight})`,
        `naturalWidth=${img.naturalWidth}`
      );
    }

    // Test C: Admin Authenticated Dashboard
    console.log(`\nAuthenticating as Dad and navigating to ${baseUrl}/admin...`);
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
    await new Promise((r) => setTimeout(r, 1000));

    const adminImgs = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          });
        })
      );
      return imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        display: window.getComputedStyle(img).display,
      }));
    });

    console.log(`Found ${adminImgs.length} images on Admin Dashboard.`);
    for (const img of adminImgs.filter((i) => i.display !== "none")) {
      assert(
        img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
        `Admin img src="${img.src}" (alt="${img.alt}") loaded with natural dimensions (${img.naturalWidth}x${img.naturalHeight})`,
        `naturalWidth=${img.naturalWidth}`
      );
    }

    // Assert zero 404 network responses
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
