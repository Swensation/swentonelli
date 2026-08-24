import ical from "node-ical";
import fs from "fs";
import path from "path";

async function inspectRruleBug() {
  const configPath = path.join(process.cwd(), "config", "calendars.json");
  const sources = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const bbFeed = sources.find((s: any) => s.name.includes("Brighton"));

  const data = await ical.async.fromURL(bbFeed.icsUrl);
  for (const k in data) {
    const ev = data[k];
    if (!ev || ev.type !== "VEVENT" || !ev.rrule) continue;
    if ((ev.summary || "").includes("Field Hockey") || (ev.summary || "").includes("Therapy")) {
      console.log("==========================================");
      console.log("Summary:", ev.summary);
      console.log("ev.start (master Date):", ev.start, "ISO:", ev.start?.toISOString());
      console.log("ev.start tz:", (ev.start as any)?.tz);
      console.log("rrule options dtstart:", ev.rrule.options.dtstart);
      
      const dates = ev.rrule.between(new Date("2026-08-20"), new Date("2026-08-30"), true);
      console.log("rrule expanded dates:", dates);
    }
  }
}

inspectRruleBug().catch(console.error);
