import ical from "node-ical";
import fs from "fs";
import path from "path";

async function searchAllCustodyKeywords() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const sources = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  for (const src of sources) {
    console.log(`\n=== Scanning feed: ${src.name} ===`);
    const data = await ical.async.fromURL(src.icsUrl);
    const seenSummaries = new Set<string>();

    for (const k in data) {
      const ev = data[k];
      if (!ev || ev.type !== "VEVENT") continue;
      const s = (ev.summary || "").trim();
      const lower = s.toLowerCase();
      if (
        lower.includes("kid") ||
        lower.includes("liz") ||
        lower.includes("swen") ||
        lower.includes("andrew") ||
        lower.includes("callie") ||
        lower.includes("chris") ||
        lower.includes("weekend") ||
        lower.includes("custody")
      ) {
        if (!seenSummaries.has(s)) {
          seenSummaries.add(s);
          console.log(`  - "${s}" (datetype: ${(ev as any).datetype})`);
        }
      }
    }
  }
}

searchAllCustodyKeywords().catch(console.error);
