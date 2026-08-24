import fs from "fs";
import path from "path";

export interface ScheduleLink {
  label: string;
  url: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatarTheme: string;
  avatarIcon: string;
  color: string;
  school: string;
  grade: string;
  teacher: string;
  pediatrician: string;
  therapist: string;
  primarySport: string;
  custody: string;
  matchKeywords: string[];
  scheduleLinks: ScheduleLink[];
}

let cachedRegistry: ChildProfile[] | null = null;

export function getChildrenRegistry(): ChildProfile[] {
  if (cachedRegistry) return cachedRegistry;

  try {
    const filePath = path.join(process.cwd(), "data", "children_registry.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedRegistry = JSON.parse(raw);
      return cachedRegistry || [];
    }
  } catch (err) {
    console.error("Failed to read data/children_registry.json:", err);
  }

  return [];
}

/**
 * Resolves a child profile based on direct name matching, calendar source feed boundaries,
 * and dynamic registry keywords.
 */
export function findChildByEventText(
  summary: string,
  description?: string,
  sourceName?: string
): ChildProfile | null {
  const summaryLower = (summary || "").toLowerCase();
  const descLower = (description || "").toLowerCase();
  const sourceLower = (sourceName || "").toLowerCase();
  const fullText = `${summaryLower} ${descLower}`.trim();
  const registry = getChildrenRegistry();

  // 1. Direct Name Match First (Highest Priority)
  // Check exact child first names with word boundaries in summary first, then description
  for (const child of registry) {
    const nameLower = child.name.toLowerCase();
    const nameRegex = new RegExp(`\\b${nameLower}\\b`, "i");
    if (nameRegex.test(summaryLower)) {
      return child;
    }
  }

  // Handle "Ben " or "Ben's" abbreviation for Benjamin (avoid matching Bennett)
  if (/\bben('s)?\b/i.test(summaryLower)) {
    const ben = registry.find((c) => c.id === "benjamin");
    if (ben) return ben;
  }

  // 2. Calendar Source Feed Boundaries
  // Events from "Brighton and Bennett" feed MUST NOT map to Aria or Benjamin.
  // Events from "Aria and Ben" feed MUST NOT map to Brighton or Bennett.
  let candidates = registry;
  if (sourceLower.includes("brighton") || sourceLower.includes("bennett")) {
    candidates = registry.filter((c) => c.id === "brighton" || c.id === "bennett");
  } else if (sourceLower.includes("aria") || sourceLower.includes("ben")) {
    candidates = registry.filter((c) => c.id === "aria" || c.id === "benjamin");
  }

  // Also check description for exact child names within eligible candidates
  for (const child of candidates) {
    const nameLower = child.name.toLowerCase();
    const nameRegex = new RegExp(`\\b${nameLower}\\b`, "i");
    if (nameRegex.test(descLower)) {
      return child;
    }
  }

  // 3. Keyword Match within Eligible Candidates
  for (const child of candidates) {
    const hasMatch = child.matchKeywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      return fullText.includes(kwLower);
    });

    if (hasMatch) {
      return child;
    }
  }

  return null;
}

export function getChildProfile(childId: string): ChildProfile | undefined {
  const registry = getChildrenRegistry();
  return registry.find((c) => c.id.toLowerCase() === childId.toLowerCase());
}
