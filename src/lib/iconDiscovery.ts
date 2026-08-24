import fs from "fs";
import path from "path";

export interface DiscoveredIconSuggestion {
  id: string;
  category: string;
  badgeText: string;
  candidateIconUrl: string;
  sourceDomain?: string;
  confidence: "high" | "medium" | "low";
  summaryPatterns: string[];
}

interface StoredSuggestionRule {
  id: string;
  matchPatterns: string[];
  category: string;
  badgeText: string;
  candidateIconUrl: string;
  sourceDomain?: string;
  confidence?: "high" | "medium" | "low";
}

let cachedSuggestions: StoredSuggestionRule[] | null = null;

export function loadStoredSuggestions(): StoredSuggestionRule[] {
  if (cachedSuggestions) return cachedSuggestions;
  try {
    const filePath = path.join(process.cwd(), "data", "suggested_icons.json");
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    cachedSuggestions = JSON.parse(raw);
    return cachedSuggestions || [];
  } catch (err) {
    console.error("Failed to read suggested_icons.json:", err);
    return [];
  }
}

/**
 * Extracts a candidate business/venue name and infers its website domain.
 */
export function extractVenueOrBusiness(text: string): { name: string; domain: string } | null {
  // Strip child/friend possessives ("Juliana's", "Bennett's")
  let clean = text
    .replace(/^[A-Za-z]+('s|’s)\s+(bday|birthday|party|practice|game)\s+/i, "")
    .replace(/\b([A-Za-z]+('s|’s))\b/gi, "")
    .replace(/\b(bday|birthday|party|celebration|annual|session|meeting|appointment|visit)\b/gi, "")
    .replace(/\b(in|at|@)\s+(Natick|Boston|Holliston|Framingham|Milford|Medway|Ashland|Westborough|Bellingham|Norfolk|Hopkinton|Marlborough)\b/gi, "")
    .replace(/\b(in|at|@)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean || clean.length < 3) return null;

  // Known local and regional venue mappings
  const knownMap: Record<string, { name: string; domain: string }> = {
    level99: { name: "Level99", domain: "level99.com" },
    urbanair: { name: "Urban Air", domain: "urbanair.com" },
    skyzone: { name: "Sky Zone", domain: "skyzone.com" },
    apex: { name: "Apex Entertainment", domain: "apexentertainment.com" },
    forekicks: { name: "Fore Kicks", domain: "forekicks.com" },
    bowlero: { name: "Bowlero", domain: "bowlero.com" },
    daveandbusters: { name: "Dave & Buster's", domain: "daveandbusters.com" },
    launch: { name: "Launch Trampoline Park", domain: "launchtrampolinepark.com" },
    rollerkingdom: { name: "Roller Kingdom", domain: "rollerkingdom.com" },
    placentino: { name: "Placentino Elementary", domain: "holliston.k12.ma.us" },
  };

  const lower = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, val] of Object.entries(knownMap)) {
    if (lower.includes(key)) {
      return val;
    }
  }

  // Dynamic domain inference
  const candidateDomain = `${lower}.com`;
  return {
    name: clean,
    domain: candidateDomain,
  };
}

/**
 * Given a summary group text and sample event texts, discovers or generates
 * the best candidate icon suggestion using pre-seeded rules, semantic event types,
 * or dynamic venue domain guessing.
 */
export function discoverIconForEventGroup(
  summaryGroup: string,
  sampleEvents: string[] = []
): DiscoveredIconSuggestion | null {
  const stored = loadStoredSuggestions();
  const fullText = (summaryGroup + " " + sampleEvents.join(" ")).toLowerCase();

  // 1. Check pre-seeded / stored candidate catalog
  for (const rule of stored) {
    const isMatch = rule.matchPatterns.some((pattern) =>
      fullText.includes(pattern.toLowerCase())
    );
    if (isMatch) {
      return {
        id: rule.id,
        category: rule.category,
        badgeText: rule.badgeText,
        candidateIconUrl: rule.candidateIconUrl,
        sourceDomain: rule.sourceDomain,
        confidence: rule.confidence || "medium",
        summaryPatterns: [summaryGroup.toLowerCase()],
      };
    }
  }

  // 2. Dynamic Venue & Business Entity Extraction (e.g. "Level99 in Natick", "Urban Air", "Sky Zone")
  const venue = extractVenueOrBusiness(summaryGroup) || (sampleEvents.length > 0 ? extractVenueOrBusiness(sampleEvents[0]) : null);
  if (venue && venue.domain) {
    const isBirthday = /\b(bday|birthday|party)\b/i.test(fullText);
    const candidateIconUrl = `https://www.google.com/s2/favicons?domain=${venue.domain}&sz=128`;

    return {
      id: `suggest-venue-${venue.domain.replace(/\./g, "_")}`,
      category: isBirthday ? `Birthday @ ${venue.name}` : venue.name,
      badgeText: isBirthday ? `🎂 ${venue.name}` : venue.name,
      candidateIconUrl,
      sourceDomain: venue.domain,
      confidence: "high",
      summaryPatterns: [venue.name.toLowerCase(), summaryGroup.toLowerCase()],
    };
  }

  // 3. Semantic Milestone & Activity Fallbacks
  if (/\b(bday|birthday|party|sleepover|playdate)\b/i.test(fullText)) {
    return {
      id: "suggest-birthday",
      category: "Birthday Party",
      badgeText: "🎂 Birthday",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/3159/3159066.png",
      sourceDomain: "celebration.org",
      confidence: "high",
      summaryPatterns: ["bday", "birthday", "party"],
    };
  }

  if (/\b(camp|day camp|summer camp|scouts|cub scouts|girl scouts|troop)\b/i.test(fullText)) {
    return {
      id: "suggest-camp-scouts",
      category: "Camp & Scouts",
      badgeText: "⛺ Camp / Scouts",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
      sourceDomain: "scouts.org",
      confidence: "medium",
      summaryPatterns: ["camp", "scouts", "troop"],
    };
  }

  if (/\b(recital|concert|dance|piano|guitar|theater|ballet|musical)\b/i.test(fullText)) {
    return {
      id: "suggest-performance",
      category: "Music & Performing Arts",
      badgeText: "🎭 Recital",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/3845/3845868.png",
      sourceDomain: "arts.org",
      confidence: "medium",
      summaryPatterns: ["recital", "dance", "concert", "piano"],
    };
  }

  if (/\b(gymnastics|karate|taekwondo|martial arts|ninja|swim)\b/i.test(fullText)) {
    return {
      id: "suggest-activity",
      category: "Fitness & Martial Arts",
      badgeText: "🥋 Activity",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
      sourceDomain: "athletics.org",
      confidence: "medium",
      summaryPatterns: ["gymnastics", "karate", "swim", "ninja"],
    };
  }

  return null;
}
