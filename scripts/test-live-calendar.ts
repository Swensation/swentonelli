import fs from "fs";
import path from "path";
import ical from "node-ical";

const envPath = path.join(process.cwd(), ".env.local");
const content = fs.readFileSync(envPath, "utf-8");
let sources: any[] = [];
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("GOOGLE_CALENDAR_SOURCES=")) {
    let jsonStr = trimmed.slice("GOOGLE_CALENDAR_SOURCES=".length);
    if ((jsonStr.startsWith("'") && jsonStr.endsWith("'")) || (jsonStr.startsWith('"') && jsonStr.endsWith('"'))) {
      jsonStr = jsonStr.slice(1, -1);
    }
    sources = JSON.parse(jsonStr);
  }
}

async function run() {
  console.log(`Found ${sources.length} sources.`);
  for (const src of sources) {
    console.log(`\nTesting source: ${src.name} (${src.icsUrl.substring(0, 60)}...)`);
    try {
      const resp = await fetch(src.icsUrl);
      console.log(`HTTP Status: ${resp.status} ${resp.statusText}`);
      const text = await resp.text();
      console.log(`Downloaded ${text.length} bytes of iCal data.`);
      const parsed = ical.parseICS(text);
      const events = Object.values(parsed).filter((e: any) => e.type === "VEVENT");
      console.log(`Parsed ${events.length} VEVENT entries!`);
      if (events.length > 0) {
        console.log(`First 3 events:`);
        events.slice(0, 3).forEach((e: any) => {
          console.log(`  - ${e.summary} (Start: ${e.start})`);
        });
      }
    } catch (err: any) {
      console.error(`Error fetching ${src.name}:`, err.message);
    }
  }
}

run().catch(console.error);

