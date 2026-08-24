import { fetchCalendarAgenda } from "../src/lib/calendar";
import { format, parseISO } from "date-fns";

async function verifyFixes() {
  const agenda = await fetchCalendarAgenda();
  console.log("=== Events on 2026-08-26 ===");
  const events = agenda.byDate["2026-08-26"] || [];
  events.forEach(e => {
    const dStart = new Date(e.start);
    const dEnd = new Date(e.end);
    const easternTime = dStart.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
    const easternEnd = dEnd.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
    console.log(`- Summary: "${e.summary}"`);
    console.log(`  Source: ${e.sourceName}`);
    console.log(`  UTC start: ${e.start}`);
    console.log(`  Eastern Time: ${easternTime} - ${easternEnd}`);
    console.log(`  Child: ${e.enrichment?.child?.name || "Unassigned"}`);
    console.log(`  Category: ${e.enrichment?.category || "None"}`);
    console.log(`  Badge: ${e.enrichment?.badgeText || "None"}`);
  });
}

verifyFixes().catch(console.error);

