import { fetchCalendarAgenda } from "../src/lib/calendar";

async function main() {
  const agenda = await fetchCalendarAgenda();
  console.log("Today events count:", agenda.today.length);
  agenda.today.forEach((e) => {
    console.log(`[TODAY] Summary: "${e.summary}" | Source: "${e.sourceName}" | Start: ${e.start} | Desc: "${e.description || ""}"`);
  });

  const allDates = Object.keys(agenda.byDate).sort();
  console.log(`Found events across ${allDates.length} distinct dates:`, allDates.slice(0, 10), "...", allDates.slice(-5));

  for (const date of allDates) {
    const events = agenda.byDate[date];
    const osfc = events.filter(e => e.summary.toLowerCase().includes("osfc") || (e.description && e.description.toLowerCase().includes("old school")));
    if (osfc.length > 0) {
      console.log(`Found OSFC events on ${date}:`);
      osfc.forEach(e => console.log(`  - ${e.summary} (${e.start})`));
    }
  }
}

main().catch(console.error);

