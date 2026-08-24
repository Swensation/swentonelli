import { CalendarEvent } from "@/types/calendar";

export interface CustodyAnnotation {
  status: "dad" | "mom";
  parentName: string;
  town: string;
  label: "Dad's" | "Mom's";
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
 * Determines whether a calendar event is an annotation event (Custody or No-School)
 * that should be converted into a header badge rather than a timeline card.
 */
export function isAnnotationEvent(event: CalendarEvent): boolean {
  const summary = (event.summary || "").toLowerCase().trim();

  // 1. Custody Event Triggers
  if (
    summary === "liz kids" ||
    summary.includes("liz kids") ||
    summary === "callie kids" ||
    summary.includes("callie kids") ||
    summary === "andrew kids" ||
    summary.includes("andrew kids") ||
    summary === "swen kids" ||
    summary.includes("swen kids") ||
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
 * - Chris (Dad for Aria/Ben - Franklin): Blue (bg-blue-600/25 text-blue-300 border-blue-500/50)
 * - Liz (Mom for Brighton/Bennett - Holliston): Red (bg-red-600/25 text-red-300 border-red-500/50)
 * - Andrew & Callie (Millis): Maroon (bg-[#800020]/30 text-rose-300 border-[#9f1239]/60)
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
      if (summary.includes("liz kids")) {
        custody = {
          status: "mom",
          parentName: "Liz",
          town: "Holliston",
          label: "Mom's",
          badgeClass: "bg-red-600 text-white border-red-400 shadow-sm",
        };
      } else if (summary.includes("andrew kids") || summary.includes("swen kids")) {
        custody = {
          status: "dad",
          parentName: "Andrew",
          town: "Millis",
          label: "Dad's",
          badgeClass: "bg-[#800020] text-rose-50 border-[#9f1239] shadow-sm",
        };
      }
    }

    // Check Benjamin & Aria Custody: If the day has "Callie kids" event -> Callie (Mom's in Millis, Maroon)
    if (cId === "aria" || cId === "benjamin") {
      if (summary.includes("callie kids")) {
        custody = {
          status: "mom",
          parentName: "Callie",
          town: "Millis",
          label: "Mom's",
          badgeClass: "bg-[#800020] text-rose-50 border-[#9f1239] shadow-sm",
        };
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
    custody = {
      status: "dad",
      parentName: "Chris",
      town: "Franklin",
      label: "Dad's",
      badgeClass: "bg-blue-600 text-white border-blue-400 shadow-sm",
    };
  }

  return {
    custody,
    school,
  };
}

/**
 * Filters out custody and school status annotation events from the list of timeline events.
 */
export function filterActivityEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((ev) => !isAnnotationEvent(ev));
}
