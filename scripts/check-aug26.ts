import { fetchCalendarAgenda } from "../src/lib/calendar";

async function checkAugust26() {
  const agenda = await fetchCalendarAgenda();
  console.log("Events on 2026-08-26:");
  const events = agenda.byDate["2026-08-26"] || [];
  events.forEach(e => {
    console.log(`- Summary: "${e.summary}"`);
    console.log(`  Source: ${e.sourceName}`);
    console.log(`  Start: ${e.start}`);
    console.log(`  Child: ${e.enrichment?.child?.name || "Unassigned"}`);
    console.log(`  Category: ${e.enrichment?.category || "None"}`);
    console.log(`  Badge: ${e.enrichment?.badgeText || "None"}`);
  });
}

checkAugust26().catch(console.error);
