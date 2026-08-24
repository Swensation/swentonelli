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
  secondaryActivity: string;
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
 * Resolves a child profile based on event summary and description keywords
 * using the dynamic child registry.
 */
export function findChildByEventText(summary: string, description?: string): ChildProfile | null {
  const fullText = `${summary} ${description || ""}`.toLowerCase();
  const registry = getChildrenRegistry();

  for (const child of registry) {
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
