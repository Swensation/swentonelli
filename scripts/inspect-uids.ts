import ical from "node-ical";
import fs from "fs";
import path from "path";

async function inspectUids() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const sources = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  for (const src of sources) {
    console.log(`\n=== Source: ${src.name} ===`);
    const data = await ical.async.fromURL(src.icsUrl);
    let count = 0;
    for (const k in data) {
      const ev = data[k];
      if (!ev || ev.type !== "VEVENT") continue;
      if (count++ < 3) {
        console.log(`Summary: "${ev.summary}"`);
        console.log(`  UID: "${ev.uid}"`);
        console.log(`  URL field: "${(ev as any).url}"`);
      }
    }
  }
}

inspectUids().catch(console.error);
