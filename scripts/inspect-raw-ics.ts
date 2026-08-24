import ical from "node-ical";
import fs from "fs";
import path from "path";

async function inspectRawEvents() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const raw = fs.readFileSync(configPath, "utf-8");
  const sources = JSON.parse(raw);

  for (const src of sources) {
    console.log(`\n========================================`);
    console.log(`Feed: ${src.name} (${src.icsUrl.slice(0, 40)}...)`);
    console.log(`========================================`);
    try {
      const data = await ical.async.fromURL(src.icsUrl);
      for (const k in data) {
        const ev = data[k];
        if (!ev || ev.type !== "VEVENT") continue;
        const summary = ev.summary || "";
        const sLower = summary.toLowerCase();
        if (
          sLower.includes("field hockey") ||
          sLower.includes("therapy") ||
          sLower.includes("patoma") ||
          sLower.includes("practice") ||
          sLower.includes("26")
        ) {
          console.log(`\nSummary: "${summary}"`);
          console.log(`  Raw start:`, ev.start);
          console.log(`  Start type:`, typeof ev.start, ev.start?.toISOString?.());
          console.log(`  Raw end:`, ev.end);
          console.log(`  Description:`, (ev.description || "").slice(0, 100));
          console.log(`  Location:`, ev.location);
        }
      }
    } catch (err: any) {
      console.error(`Error loading ${src.name}:`, err.message);
    }
  }
}

inspectRawEvents().catch(console.error);

