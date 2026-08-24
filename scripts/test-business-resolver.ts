/**
 * Generic Business Entity & Domain Resolver
 *
 * Given an arbitrary event title, extracts the business/venue/organization,
 * infers its likely domain, and fetches candidate brand logo URLs.
 */

interface BusinessEntity {
  cleanName: string;
  eventType?: string;
  inferredDomain?: string;
  candidateLogos: string[];
}

export function extractBusinessEntity(eventSummary: string, eventDescription?: string): BusinessEntity | null {
  const fullText = `${eventSummary} ${eventDescription || ""}`.trim();
  
  // Detect Event Type
  let eventType = "General Activity";
  if (/\b(bday|birthday|party|sleepover)\b/i.test(fullText)) {
    eventType = "Birthday Party";
  } else if (/\b(practice|game|tournament|match|scrimmage|training)\b/i.test(fullText)) {
    eventType = "Sports / Athletics";
  } else if (/\b(dr|doctor|pediatric|dental|dentist|ortho|therapy|counseling|clinic)\b/i.test(fullText)) {
    eventType = "Medical & Health";
  } else if (/\b(school|orientation|meet and greet|pto|pta|kindergarten|grade)\b/i.test(fullText)) {
    eventType = "School & Education";
  }

  // Remove common noise words, prefixes, and possessives (e.g. "Juliana's bday ", "Bennett's ", "Annual ")
  let cleaned = eventSummary
    .replace(/^[A-Za-z]+('s|’s)\s+(bday|birthday|party|practice|game)\s+/i, "")
    .replace(/\b([A-Za-z]+('s|’s))\b/gi, "")
    .replace(/\b(bday|birthday|party|annual|welcome|session|meeting|appointment|visit)\b/gi, "")
    .replace(/\b(in|at|@)\s+[A-Za-z]+/gi, (match) => {
      // Keep place if it's venue, but strip "in Natick" / "at Boston"
      const cityMatch = match.match(/\b(in|at|@)\s+(Natick|Boston|Holliston|Framingham|Milford|Medway|Ashland|Westborough|Bellingham|Norfolk|Hopkinton)\b/i);
      return cityMatch ? "" : match;
    })
    .replace(/\s+/g, " ")
    .trim();

  // If after cleaning we have a distinct candidate entity name
  if (!cleaned || cleaned.length < 3) return null;

  // Derive domain slug
  const domainSlug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^(the|at)/, "");

  const candidateDomains = [
    `${domainSlug}.com`,
    `${domainSlug}.org`,
    `${domainSlug}.net`,
  ];

  // Common known local venues fast-path
  const knownMap: Record<string, string> = {
    level99: "level99.com",
    urbanair: "urbanair.com",
    skyzone: "skyzone.com",
    apex: "apexentertainment.com",
    apexentertainment: "apexentertainment.com",
    forekicks: "forekicks.com",
    bowlero: "bowlero.com",
    daveandbusters: "daveandbusters.com",
    launch: "launchtrampolinepark.com",
    rollerkingdom: "rollerkingdom.com",
    placentino: "holliston.k12.ma.us",
  };

  const matchedDomain = Object.entries(knownMap).find(([k]) => domainSlug.includes(k))?.[1] || candidateDomains[0];

  const candidateLogos = [
    `https://logo.clearbit.com/${matchedDomain}`,
    `https://icon.horse/icon/${matchedDomain}`,
    `https://www.google.com/s2/favicons?domain=${matchedDomain}&sz=128`,
  ];

  return {
    cleanName: cleaned,
    eventType,
    inferredDomain: matchedDomain,
    candidateLogos,
  };
}

// Test cases
const testEvents = [
  "Juliana’s bday Level99 in Natick",
  "Lucas 9th Birthday Party at Urban Air Bellingham",
  "Aria Sky Zone Trampoline Jump Night",
  "Bennett Fore Kicks Soccer Practice",
  "Apex Entertainment Arcade Night with Cousins",
  "Miller School Grade 4 Meet and Greet",
];

console.log("=== Testing Generic Business Entity & Logo Resolver ===");
testEvents.forEach(evt => {
  const result = extractBusinessEntity(evt);
  console.log(`\nEvent: "${evt}"`);
  console.log("-> Clean Name:", result?.cleanName);
  console.log("-> Event Type:", result?.eventType);
  console.log("-> Inferred Domain:", result?.inferredDomain);
  console.log("-> Candidate Logo:", result?.candidateLogos[0]);
});

