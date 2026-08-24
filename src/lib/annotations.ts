import { CalendarEvent } from "@/types/calendar";

export interface CustodyAnnotation {
  status: "dad" | "mom";
  parentName: string;
  label: string;
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
 * Custody Rules:
 * - Brighton / Bennett: "Liz kids" -> With Mom (Liz). "Andrew kids" / "Swen kids" -> With Dad (Andrew).
 * - Benjamin / Aria: "Callie kids" -> With Mom (Callie). Otherwise -> With Dad (Chris).
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
          label: "With Mom",
          badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
      } else if (summary.includes("andrew kids") || summary.includes("swen kids")) {
        custody = {
          status: "dad",
          parentName: "Andrew",
          label: "With Dad",
          badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      }
    }

    // Check Benjamin & Aria Custody
    if (cId === "aria" || cId === "benjamin") {
      if (summary.includes("callie kids")) {
        custody = {
          status: "mom",
          parentName: "Callie",
          label: "With Mom",
          badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
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

  // Aria / Benjamin default custody rule: If not with Callie ("Callie kids"), they are with Dad
  if ((cId === "aria" || cId === "benjamin") && !custody) {
    custody = {
      status: "dad",
      parentName: "Chris",
      label: "With Dad",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    };
  }

  return {
    custody,
    school,
  };
}

/**
 * Filters out annotation events from the list of timeline cards.
 */
export function filterActivityEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => !isAnnotationEvent(e));
}

