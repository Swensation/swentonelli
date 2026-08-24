import { fetchCalendarAgenda } from "../src/lib/calendar";
import { isAnnotationEvent } from "../src/lib/annotations";
import { addDays, endOfDay, format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

async function main() {
  const agenda = await fetchCalendarAgenda();
  const now = new Date();
  const windowStart = startOfDay(now);
  const windowEnd = endOfDay(addDays(now, 60));

  const allEvents = Object.entries(agenda.byDate)
    .filter(([dateKey]) => {
      const d = parseISO(dateKey);
      return !isBefore(d, windowStart) && !isAfter(d, windowEnd);
    })
    .flatMap(([, events]) => events);

  console.log(`Total events in 60-day window: ${allEvents.length}`);

  const unassigned = allEvents.filter(e => !e.enrichment?.child && !isAnnotationEvent(e));
  const unbranded = allEvents.filter(e => !e.enrichment?.iconUrl && !isAnnotationEvent(e));

  console.log("\n=== UNASSIGNED ACTIVITIES (Needs Child Mapping) ===");
  const seenUnassigned = new Set<string>();
  unassigned.forEach(e => {
    if (!seenUnassigned.has(e.summary)) {
      seenUnassigned.add(e.summary);
      console.log(`- "${e.summary}" | Start: ${e.start} | Loc: ${e.location || "None"} | Feed: ${e.sourceName}`);
    }
  });

  console.log("\n=== UNBRANDED ACTIVITIES (Needs Crest / Icon) ===");
  const seenUnbranded = new Set<string>();
  unbranded.forEach(e => {
    if (!seenUnbranded.has(e.summary)) {
      seenUnbranded.add(e.summary);
      console.log(`- "${e.summary}" | Feed: ${e.sourceName} | Child: ${e.enrichment?.child?.name || "Unassigned"}`);
    }
  });
}

main().catch(console.error);

