import { CalendarEvent } from "@/types/calendar";

export interface CustodyAnnotation {
  status: "dad" | "mom" | "error";
  parentName: string;
  town: string;
  label: "Dad's" | "Mom's" | "!";
  bgColor: string;
  borderColor: string;
  badgeStyle: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
  badgeClass: string;
}

export interface SchoolAnnotation {
  status: "no_school" | "early_release";
  label: string;
  badgeClass: string;
}

export interface ChildDayAnnotations {
  custody?: CustodyAnnotation;
  school?: SchoolAnnotation;
}

/**
 * Town & Custody Color Profiles
 * - Chris (Franklin): Blue (#2563eb)
 * - Liz (Holliston): Red (#dc2626)
 * - Andrew & Callie (Millis): Maroon (#800020)
 * - Error / Unexpected: Amber/Gold (#d97706) with "!"
 */
export const CUSTODY_PROFILES = {
  chris: {
    status: "dad" as const,
    parentName: "Chris",
    town: "Franklin",
    label: "Dad's" as const,
    bgColor: "#2563eb",
    borderColor: "#60a5fa",
    badgeStyle: {
      backgroundColor: "#2563eb",
      borderColor: "#60a5fa",
      color: "#ffffff",
    },
    badgeClass: "bg-blue-600 text-white border-blue-400 shadow-sm",
  },
  liz: {
    status: "mom" as const,
    parentName: "Liz",
    town: "Holliston",
    label: "Mom's" as const,
    bgColor: "#dc2626",
    borderColor: "#f87171",
    badgeStyle: {
      backgroundColor: "#dc2626",
      borderColor: "#f87171",
      color: "#ffffff",
    },
    badgeClass: "bg-red-600 text-white border-red-400 shadow-sm",
  },
  andrew: {
    status: "dad" as const,
    parentName: "Andrew",
    town: "Millis",
    label: "Dad's" as const,
    bgColor: "#800020",
    borderColor: "#9f1239",
    badgeStyle: {
      backgroundColor: "#800020",
      borderColor: "#9f1239",
      color: "#ffffff",
    },
    badgeClass: "bg-[#800020] text-white border-[#9f1239] shadow-sm",
  },
  callie: {
    status: "mom" as const,
    parentName: "Callie",
    town: "Millis",
    label: "Mom's" as const,
    bgColor: "#800020",
    borderColor: "#9f1239",
    badgeStyle: {
      backgroundColor: "#800020",
      borderColor: "#9f1239",
      color: "#ffffff",
    },
    badgeClass: "bg-[#800020] text-white border-[#9f1239] shadow-sm",
  },
  error: {
    status: "error" as const,
    parentName: "Conflicted Schedule",
    town: "Check Calendar",
    label: "!" as const,
    bgColor: "#d97706",
    borderColor: "#f59e0b",
    badgeStyle: {
      backgroundColor: "#b45309",
      borderColor: "#f59e0b",
      color: "#ffffff",
    },
    badgeClass: "bg-amber-600 text-white border-amber-400 shadow-sm font-black text-xs",
  },
};

/**
 * Determines whether a calendar event is an annotation event (Custody or No-School)
 * that should be converted into a header badge rather than a timeline card.
 */
export function isAnnotationEvent(event: CalendarEvent): boolean {
  const summary = (event.summary || "").toLowerCase().trim();

  // 1. Custody Event Triggers (Clean exact titles, avoiding fuzzy substrings)
  if (
    summary === "liz kids" ||
    summary === "andrew kids" ||
    summary === "swen kids" ||
    summary === "callie kids" ||
    summary === "chris kids" ||
    summary === "kids" ||
    summary === "kid" ||
    summary === "custody"
  ) {
    return true;
  }

  // 2. School Status Triggers
  if (
    summary.includes("no school") ||
    summary.includes("school closed") ||
    summary.includes("holiday - no school") ||
    summary.includes("teacher professional") ||
    summary.includes("professional development day") ||
    summary.includes("early release") ||
    summary.includes("half day") ||
    summary.includes("early dismissal")
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts custody and school status annotations for a specific child on a given day.
 *
 * Direct User Rules:
 * - Brighton / Bennett:
 *   - Exactly "Liz kids" -> Mom's (Liz in Holliston - Red)
 *   - Otherwise -> Dad's (Andrew in Millis - Maroon)
 *   - Fallback on conflict/error -> show "!" error badge
 * - Aria / Benjamin:
 *   - Exactly "Callie kids" -> Mom's (Callie in Millis - Maroon)
 *   - Otherwise -> Dad's (Chris in Franklin - Blue)
 *   - Fallback on conflict/error -> show "!" error badge
 */
export function extractChildAnnotations(
  dayEvents: CalendarEvent[],
  childId: string
): ChildDayAnnotations {
  const cId = childId.toLowerCase();
  let custody: CustodyAnnotation | undefined;
  let school: SchoolAnnotation | undefined;

  try {
    // Check Brighton & Bennett Custody
    if (cId === "brighton" || cId === "bennett") {
      let hasLiz = false;
      let hasAndrew = false;

      for (const ev of dayEvents) {
        const summary = (ev.summary || "").trim().toLowerCase();
        if (summary === "liz kids") {
          hasLiz = true;
        } else if (summary === "andrew kids" || summary === "swen kids") {
          hasAndrew = true;
        }
      }

      if (hasLiz && hasAndrew) {
        // Conflicting custody indicators on the same day -> Fallback error badge
        custody = { ...CUSTODY_PROFILES.error };
      } else if (hasLiz) {
        custody = { ...CUSTODY_PROFILES.liz };
      } else {
        // Otherwise, Andrew
        custody = { ...CUSTODY_PROFILES.andrew };
      }
    }

    // Check Benjamin & Aria Custody
    if (cId === "aria" || cId === "benjamin") {
      let hasCallie = false;
      let hasChris = false;

      for (const ev of dayEvents) {
        const summary = (ev.summary || "").trim().toLowerCase();
        if (summary === "callie kids") {
          hasCallie = true;
        } else if (summary === "chris kids") {
          hasChris = true;
        }
      }

      if (hasCallie && hasChris) {
        // Conflicting custody indicators on the same day -> Fallback error badge
        custody = { ...CUSTODY_PROFILES.error };
      } else if (hasCallie) {
        custody = { ...CUSTODY_PROFILES.callie };
      } else {
        // Otherwise, Chris
        custody = { ...CUSTODY_PROFILES.chris };
      }
    }
  } catch {
    custody = { ...CUSTODY_PROFILES.error };
  }

  // Check School Status
  for (const ev of dayEvents) {
    const summary = (ev.summary || "").toLowerCase().trim();
    const sourceId = (ev.sourceId || "").toLowerCase();

    // District & Child Scoping:
    // Aria & Benjamin -> Millis Public Schools (MPS, CFB, Millis Middle)
    // Brighton & Bennett -> Holliston Public Schools (HPS, Adams Middle, Miller)
    const isMillisChild = cId === "aria" || cId === "benjamin";
    const isHollistonChild = cId === "brighton" || cId === "bennett";

    const hasMillisScope =
      summary.includes("millis") ||
      summary.includes("mps") ||
      summary.includes("aria") ||
      summary.includes("ben") ||
      summary.includes("cfb") ||
      sourceId === "aria-ben";

    const hasHollistonScope =
      summary.includes("holliston") ||
      summary.includes("hps") ||
      summary.includes("adams") ||
      summary.includes("miller") ||
      summary.includes("placentino") ||
      summary.includes("brighton") ||
      summary.includes("bennett") ||
      sourceId === "brighton-bennett";

    // If explicitly scoped to Millis, do NOT apply to Holliston children
    if (hasMillisScope && !hasHollistonScope && !isMillisChild) {
      continue;
    }
    // If explicitly scoped to Holliston, do NOT apply to Millis children
    if (hasHollistonScope && !hasMillisScope && !isHollistonChild) {
      continue;
    }

    if (
      summary.includes("no school") ||
      summary.includes("school closed") ||
      summary.includes("holiday - no school") ||
      summary.includes("teacher professional")
    ) {
      school = {
        status: "no_school",
        label: "No School",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      };
    } else if (
      summary.includes("early release") ||
      summary.includes("half day") ||
      summary.includes("early dismissal")
    ) {
      if (!school) {
        school = {
          status: "early_release",
          label: "Early Release",
          badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      }
    }
  }

  return {
    custody,
    school,
  };
}

export interface DailyFamilySummary {
  ariaBen: {
    custody?: CustodyAnnotation;
    school?: SchoolAnnotation;
  };
  brightonBennett: {
    custody?: CustodyAnnotation;
    school?: SchoolAnnotation;
  };
}

/**
 * Returns household summary of the day for Ben/Aria and Brighton/Bennett
 */
export function getDailyFamilySummary(dayEvents: CalendarEvent[]): DailyFamilySummary {
  const ariaAnno = extractChildAnnotations(dayEvents, "aria");
  const brightonAnno = extractChildAnnotations(dayEvents, "brighton");

  return {
    ariaBen: {
      custody: ariaAnno.custody,
      school: ariaAnno.school,
    },
    brightonBennett: {
      custody: brightonAnno.custody,
      school: brightonAnno.school,
    },
  };
}

/**
 * Filters out custody and school status annotation events from the list of timeline events.
 */
export function filterActivityEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => !isAnnotationEvent(e));
}
