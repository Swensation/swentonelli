import { fetchCalendarAgenda } from "../src/lib/calendar";

async function checkAugust25() {
  const agenda = await fetchCalendarAgenda();
  console.log("Events on 2026-08-25:");
  const events = agenda.byDate["2026-08-25"] || [];
  events.forEach(e => {
    console.log(`- Summary: "${e.summary}" | Feed: "${e.sourceName}" | Start: ${e.start}`);
  });
}

checkAugust25().catch(console.error);
