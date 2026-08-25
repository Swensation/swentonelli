import { CalendarEvent } from "@/types/calendar";

export interface CustodyAnnotation {
  status: "dad" | "mom";
  parentName: string;
  town: string;
  label: "Dad's" | "Mom's";
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
};

/**
 * Determines whether a calendar event is an annotation event (Custody or No-School)
 * that should be converted into a header badge rather than a timeline card.
 */
export function isAnnotationEvent(event: CalendarEvent): boolean {
  const summary = (event.summary || "").toLowerCase().trim();

  // 1. Custody Event Triggers
  if (
    summary === "kids" ||
    summary === "kid" ||
    summary.includes("liz kid") ||
    summary.includes("liz kids") ||
    summary.includes("with liz") ||
    summary.includes("liz has kids") ||
    (summary.includes("liz") && summary.includes("vacation")) ||
    summary.includes("callie kid") ||
    summary.includes("callie kids") ||
    summary.includes("with callie") ||
    (summary.includes("callie") && summary.includes("vacation")) ||
    summary.includes("andrew kid") ||
    summary.includes("andrew kids") ||
    summary.includes("with andrew") ||
    summary.includes("andrew has kids") ||
    summary.includes("swen kid") ||
    summary.includes("swen kids") ||
    summary.includes("with swen") ||
    summary.includes("swen has kids") ||
    ((summary.includes("andrew") || summary.includes("swen")) && summary.includes("vacation")) ||
    summary.includes("chris kid") ||
    summary.includes("chris kids") ||
    summary.includes("custody")
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
 * Location & Color Matrix:
 * - Chris (Dad for Aria/Ben - Franklin): Blue (#2563eb)
 * - Liz (Mom for Brighton/Bennett - Holliston): Red (#dc2626)
 * - Andrew & Callie (Millis): Maroon (#800020)
 *
 * Custody Rules:
 * - Brighton / Bennett: "Liz kids" -> Mom's (Liz - Red). "Andrew kids" / "Swen kids" -> Dad's (Andrew - Maroon).
 * - Benjamin / Aria: "Callie kids" -> Mom's (Callie - Maroon). Otherwise -> Dad's (Chris - Blue).
 */
export function extractChildAnnotations(
  dayEvents: CalendarEvent[],
  childId: string
): ChildDayAnnotations {
  const cId = childId.toLowerCase();
  let custody: CustodyAnnotation | undefined;
  let school: SchoolAnnotation | undefined;

  for (const ev of dayEvents) {
    const summary = (ev.summary || "").toLowerCase().trim();

    // Check Brighton & Bennett Custody
    if (cId === "brighton" || cId === "bennett") {
      const isLiz =
        summary.includes("liz kid") ||
        summary.includes("liz kids") ||
        summary.includes("with liz") ||
        summary.includes("liz has kids") ||
        (summary.includes("liz") && summary.includes("vacation"));

      const isAndrew =
        summary.includes("andrew kid") ||
        summary.includes("andrew kids") ||
        summary.includes("swen kid") ||
        summary.includes("swen kids") ||
        summary.includes("with andrew") ||
        summary.includes("with swen") ||
        summary.includes("andrew has kids") ||
        summary.includes("swen has kids") ||
        ((summary.includes("andrew") || summary.includes("swen")) && summary.includes("vacation"));

      if (isLiz) {
        custody = { ...CUSTODY_PROFILES.liz };
      } else if (isAndrew) {
        custody = { ...CUSTODY_PROFILES.andrew };
      }
    }

    // Check Benjamin & Aria Custody: If the day has "Callie kids" event -> Callie (Mom's in Millis, Maroon)
    if (cId === "aria" || cId === "benjamin") {
      const isCallie =
        summary.includes("callie kid") ||
        summary.includes("callie kids") ||
        summary.includes("with callie") ||
        (summary.includes("callie") && summary.includes("vacation"));

      if (isCallie) {
        custody = { ...CUSTODY_PROFILES.callie };
      }
    }

    // Check School Status
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

  // Aria / Benjamin rule of thumb:
  // "if the day has Callie kids event, then that means with Callie (Mom's). otherwise, Dad's (Chris in Franklin)"
  if ((cId === "aria" || cId === "benjamin") && !custody) {
    custody = { ...CUSTODY_PROFILES.chris };
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
