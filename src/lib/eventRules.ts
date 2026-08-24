import { EventEnrichment } from "@/types/calendar";
import { findChildByEventText } from "@/lib/childrenRegistry";
import fs from "fs";
import path from "path";

export interface EventRule {
  id: string;
  childId?: string;
  childName?: string;
  childColor?: string;
  category: string;
  badgeText?: string;
  iconUrl?: string;
  iconName?: string;
  summaryPatterns?: string[];
  descriptionPatterns?: string[];
}

let cachedRules: EventRule[] | null = null;

export function loadEventRules(): EventRule[] {
  if (cachedRules) return cachedRules;

  try {
    const rulesPath = path.join(process.cwd(), "config", "event_rules.json");
    if (fs.existsSync(rulesPath)) {
      const raw = fs.readFileSync(rulesPath, "utf-8");
      cachedRules = JSON.parse(raw);
      return cachedRules || [];
    }
  } catch (err) {
    console.error("Failed to load config/event_rules.json:", err);
  }

  return [];
}

/**
 * 2-Stage Business Rules Engine:
 * Stage 1: Identify which family member / child the event belongs to via the Child Registry
 * Stage 2: Match explicit custom rules from config/event_rules.json.
 *          If no explicit custom rule is matched, strictly default to the generic calendar icon.
 */
export function enrichCalendarEvent(event: {
  summary: string;
  description?: string;
  sourceName: string;
}): EventEnrichment {
  const summaryLower = (event.summary || "").toLowerCase();
  const descLower = (event.description || "").toLowerCase();
  const sourceLower = (event.sourceName || "").toLowerCase();

  const rules = loadEventRules();

  let matchedRule: EventRule | undefined = undefined;

  // 1. Check custom rules in config/event_rules.json
  for (const rule of rules) {
    const matchSummary = rule.summaryPatterns?.some((p) =>
      summaryLower.includes(p.toLowerCase())
    );
    const matchDesc = rule.descriptionPatterns?.some((p) =>
      descLower.includes(p.toLowerCase())
    );

    if (matchSummary || matchDesc) {
      matchedRule = rule;
      break;
    }
  }

  // 2. Stage 1: Child Resolution
  let child: { id: string; name: string; color?: string } | undefined = undefined;

  if (matchedRule?.childId && matchedRule?.childName) {
    child = {
      id: matchedRule.childId,
      name: matchedRule.childName,
      color: matchedRule.childColor,
    };
  } else {
    // Dynamic resolution via Child Profiles Registry (direct name matching + feed boundary isolation)
    const registryChild = findChildByEventText(event.summary, event.description, event.sourceName);
    if (registryChild) {
      child = {
        id: registryChild.id,
        name: registryChild.name,
        color: registryChild.color,
      };
    } else if (summaryLower.includes("parent session") && sourceLower.includes("ben")) {
      child = { id: "benjamin", name: "Benjamin", color: "#ef4444" };
    } else if (summaryLower.includes("urban") && sourceLower.includes("brighton")) {
      child = { id: "brighton", name: "Brighton", color: "#f472b6" };
    } else if (summaryLower.includes("andrew") || sourceLower.includes("andrew")) {
      child = { id: "andrew", name: "Andrew (Dad)", color: "#10b981" };
    } else if (summaryLower.includes("liz")) {
      child = { id: "liz", name: "Liz (Mom)", color: "#ec4899" };
    }
  }

  // 3. Construct EventEnrichment result
  if (matchedRule) {
    return {
      child,
      category: matchedRule.category,
      badgeText: matchedRule.badgeText,
      iconUrl: matchedRule.iconUrl,
      iconName: matchedRule.iconName || "Calendar",
    };
  }

  if (child) {
    return {
      child,
      badgeText: child.name,
      iconName: "Calendar", // Strictly default to generic calendar icon
    };
  }

  // Standard generic calendar icon for any general event
  return {
    iconName: "Calendar",
    badgeText: event.sourceName,
  };
}
