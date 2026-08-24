import ical from "node-ical";
import fs from "fs";
import path from "path";

async function inspectCallieKids() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const sources = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  for (const src of sources) {
    const data = await ical.async.fromURL(src.icsUrl);
    for (const k in data) {
      const ev = data[k];
      if (!ev || ev.type !== "VEVENT") continue;
      const summary = (ev.summary || "").toLowerCase();
      if (summary.includes("callie") || summary.includes("liz") || summary.includes("swen") || summary.includes("andrew kids")) {
        console.log("-----------------------------------------");
        console.log(`Feed: ${src.name} | Summary: "${ev.summary}"`);
        console.log("  Start:", ev.start, "End:", ev.end);
        console.log("  datetype:", (ev as any).datetype);
        console.log("  rrule:", (ev as any).rrule?.toString());
      }
    }
  }
}

inspectCallieKids().catch(console.error);
