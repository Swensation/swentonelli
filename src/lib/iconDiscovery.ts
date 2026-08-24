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
 * Given a summary group text and sample event texts, discovers or generates
 * the best candidate icon suggestion.
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

  // 2. Fallback heuristic discovery for recognizable sports, health, or school keywords
  if (fullText.includes("basketball") || fullText.includes("hoops")) {
    return {
      id: "suggest-basketball",
      category: "Basketball",
      badgeText: "Basketball",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/889/889455.png",
      sourceDomain: "youthsports.org",
      confidence: "medium",
      summaryPatterns: ["basketball", "hoops"],
    };
  }

  if (fullText.includes("baseball") || fullText.includes("little league") || fullText.includes("softball")) {
    return {
      id: "suggest-baseball",
      category: "Baseball / Softball",
      badgeText: "Baseball",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/3074/3074058.png",
      sourceDomain: "littleleague.org",
      confidence: "medium",
      summaryPatterns: ["baseball", "softball", "little league"],
    };
  }

  if (fullText.includes("swim") || fullText.includes("pool") || fullText.includes("aquatics")) {
    return {
      id: "suggest-swimming",
      category: "Swimming",
      badgeText: "Swim",
      candidateIconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
      sourceDomain: "swimming.org",
      confidence: "medium",
      summaryPatterns: ["swim", "aquatics"],
    };
  }

  return null;
}
