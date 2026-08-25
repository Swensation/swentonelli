import { fetchCalendarAgenda } from "../src/lib/calendar";
import { extractChildAnnotations } from "../src/lib/annotations";

async function auditCustody() {
  const agenda = await fetchCalendarAgenda();
  const dates = Object.keys(agenda.byDate).sort();

  console.log(`Auditing custody across ${dates.length} dates...`);

  dates.slice(0, 30).forEach((dateKey) => {
    const dayEvents = agenda.byDate[dateKey] || [];
    console.log(`\n=== Date: ${dateKey} (Events: ${dayEvents.length}) ===`);
    
    // Print all event summaries on this day to see custody keywords
    dayEvents.forEach(e => {
      console.log(`  - [${e.sourceName}] "${e.summary}" (allDay: ${e.allDay})`);
    });

    ["aria", "brighton", "benjamin", "bennett"].forEach((kidId) => {
      const anno = extractChildAnnotations(dayEvents, kidId);
      console.log(`    -> ${kidId.toUpperCase()}: Custody =`, anno.custody ? `${anno.custody.label} (${anno.custody.parentName} - ${anno.custody.town} - ${anno.custody.badgeClass})` : "NONE");
    });
  });
}

auditCustody().catch(console.error);
