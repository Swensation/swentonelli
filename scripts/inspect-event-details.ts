import ical from "node-ical";
import fs from "fs";
import path from "path";

async function inspectEventDetails() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const sources = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const bbFeed = sources.find((s: any) => s.name.includes("Brighton"));

  const data = await ical.async.fromURL(bbFeed.icsUrl);
  for (const k in data) {
    const ev = data[k];
    if (!ev || ev.type !== "VEVENT") continue;
    if ((ev.summary || "").includes("Field Hockey Practice") || (ev.summary || "").includes("Brighton Therapy")) {
      console.log("-----------------------------------------");
      console.log("Summary:", ev.summary);
      console.log("Raw ev.start:", ev.start);
      console.log("Raw ev.end:", ev.end);
      console.log("Raw ev.datetype:", (ev as any).datetype);
      console.log("Raw ev.params:", (ev as any).params);
      console.log("Raw ev.rrule:", (ev as any).rrule?.toString());
    }
  }
}

inspectEventDetails().catch(console.error);
