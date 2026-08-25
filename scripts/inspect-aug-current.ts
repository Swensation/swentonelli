import { fetchCalendarAgenda } from "../src/lib/calendar";
import { extractChildAnnotations } from "../src/lib/annotations";

async function inspectAugustCurrent() {
  const agenda = await fetchCalendarAgenda();
  const dates = ["2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31"];
  
  for (const d of dates) {
    const dayEvents = agenda.byDate[d] || [];
    console.log(`\n=== Date: ${d} (Events: ${dayEvents.length}) ===`);
    dayEvents.forEach(e => console.log(`  - [${e.sourceName}] "${e.summary}"`));
    ["aria", "brighton", "benjamin", "bennett"].forEach(kidId => {
      const anno = extractChildAnnotations(dayEvents, kidId);
      console.log(`    ${kidId.toUpperCase()}:`, anno.custody ? `${anno.custody.label} (${anno.custody.parentName})` : "NO CUSTODY BADGE");
    });
  }
}

inspectAugustCurrent().catch(console.error);

