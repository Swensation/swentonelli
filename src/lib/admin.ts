import { loadEventRules } from "@/lib/eventRules";
import { fetchCalendarAgenda } from "@/lib/calendar";
import { getLunchForDates } from "@/lib/lunch";
import { DailyLunchMenu } from "@/types/lunch";
import { addDays, endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import fs from "fs";
import path from "path";

export interface AdminCalendarHousekeeping {
  activeRules: Array<{
    id: string;
    childName?: string;
    category: string;
    badgeText?: string;
    iconUrl?: string;
    summaryPatterns?: string[];
    descriptionPatterns?: string[];
  }>;
  missingIconCategories: Array<{
    id: string;
    name: string;
    child?: string;
    description: string;
    sampleEvents: string[];
    suggestedIconPath: string;
    actionNeeded: string;
  }>;
  missingDetailsWarnings: Array<{
    id: string;
    type: "missing_location" | "unassigned_child";
    title: string;
    eventSummary: string;
    eventDate: string;
    detail: string;
  }>;
  dadChecklist: Array<{
    id: string;
    title: string;
    description: string;
    status: "done" | "pending";
    category: "calendar" | "lunch";
  }>;
  evaluationWindow: {
    startDate: string;
    endDate: string;
    totalEventsInWindow: number;
  };
}

export interface AdminLunchHousekeeping {
  activeMonth: string;
  totalDays: number;
  cleanIntegrityPass: boolean;
  upcomingMissingMonths: string[];
  schoolFeedsConfigured: string[];
  alerts: string[];
}

export interface AdminDashboardData {
  calendar: AdminCalendarHousekeeping;
  lunch: AdminLunchHousekeeping;
  lastChecked: string;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const activeRules = loadEventRules();
  const agenda = await fetchCalendarAgenda();
  const lunchData = getLunchForDates();

  const now = new Date();
  const windowStart = startOfDay(now);
  const windowEnd = endOfDay(addDays(now, 30));

  // Collect all events occurring strictly within the rolling 30-day window [today ... today + 30 days]
  const upcoming30DayEvents = Object.entries(agenda.byDate)
    .filter(([dateKey]) => {
      const d = parseISO(dateKey);
      return !isBefore(d, windowStart) && !isAfter(d, windowEnd);
    })
    .flatMap(([, events]) => events);

  // Identify sample events for missing icon clusters in the next 30 days
  const placentinoSamples: string[] = [];
  const medicalSamples: string[] = [];

  upcoming30DayEvents.forEach((e) => {
    const sLower = (e.summary || "").toLowerCase();

    if (
      sLower.includes("katie pellegri") ||
      sLower.includes("placentino") ||
      sLower.includes("meet and greet") ||
      sLower.includes("elementary")
    ) {
      if (!placentinoSamples.includes(e.summary)) placentinoSamples.push(e.summary);
    } else if (
      sLower.includes("dr.") ||
      sLower.includes("doctor") ||
      sLower.includes("well visit") ||
      sLower.includes("pediatric") ||
      sLower.includes("flu")
    ) {
      if (!medicalSamples.includes(e.summary)) medicalSamples.push(e.summary);
    }
  });

  const missingIconCategories = [];

  if (placentinoSamples.length > 0) {
    missingIconCategories.push({
      id: "placentino-school",
      name: "Placentino Elementary School (Holliston)",
      child: "Bennett & Brighton (Elementary)",
      description:
        "Elementary school meet-and-greets, teacher conferences, and school calendar events in next 30 days.",
      sampleEvents: placentinoSamples.slice(0, 3),
      suggestedIconPath: "/icons/schools/placentino.png",
      actionNeeded:
        "Provide Placentino School logo/crest image or URL to replace generic calendar icon.",
    });
  }

  if (medicalSamples.length > 0) {
    missingIconCategories.push({
      id: "pediatric-medical",
      name: "Pediatric & Dental Checkups",
      child: "All Children",
      description: "Annual well visits, dental cleanings, orthodontist checkups in next 30 days.",
      sampleEvents: medicalSamples.slice(0, 3),
      suggestedIconPath: "/icons/general/medical.png",
      actionNeeded: "Assign custom health/medical icon rule for pediatric appointments.",
    });
  }

  // Scan for missing details (e.g. games/practices in next 30 days with no location specified)
  const missingDetailsWarnings: AdminCalendarHousekeeping["missingDetailsWarnings"] = [];
  upcoming30DayEvents.forEach((e) => {
    const sLower = (e.summary || "").toLowerCase();
    if (
      !e.location &&
      (sLower.includes("game") || sLower.includes("vs ") || sLower.includes("tournament"))
    ) {
      missingDetailsWarnings.push({
        id: `loc-${e.id}`,
        type: "missing_location",
        title: "Missing Location on Match / Game",
        eventSummary: e.summary,
        eventDate: e.start,
        detail: "Event has no field or address attached in Google Calendar.",
      });
    }
  });

  const hasAdamsIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "schools", "adams.png")
  );

  const hasBrightonFieldHockeyIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "teams", "brighton_field_hockey.png")
  );

  const dadChecklist = [
    {
      id: "task-osfc",
      title: "Aria OSFC Soccer Crest",
      description: "Old School Football Club logo configured and active.",
      status: "done" as const,
      category: "calendar" as const,
    },
    {
      id: "task-adams",
      title: "Adams Middle School Rams Icon",
      description:
        "Adams Middle School (Holliston) Rams crest configured and active.",
      status: (hasAdamsIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-brighton-fh",
      title: "Brighton Holliston Field Hockey Crest",
      description:
        "Holliston Field Hockey crossed-sticks emblem extracted and active.",
      status: (hasBrightonFieldHockeyIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-placentino",
      title: "Add Placentino School Icon",
      description:
        "Find and add Placentino Elementary School (Holliston) emblem for Bennett/Brighton.",
      status: "pending" as const,
      category: "calendar" as const,
    },
    {
      id: "task-sept-lunch",
      title: "Upload September 2026 Lunch Menu",
      description:
        "Upload the upcoming September 2026 school lunch PDF to data/ for automatic ingestion.",
      status: "pending" as const,
      category: "lunch" as const,
    },
  ];

  // Lunch Housekeeping
  const lunchHousekeeping: AdminLunchHousekeeping = {
    activeMonth: lunchData.activeScheduleMonth,
    totalDays: lunchData.allDays.length,
    cleanIntegrityPass: !lunchData.allDays.some((d: DailyLunchMenu) =>
      d.items.some((item: string) => item.includes("(V)"))
    ),
    upcomingMissingMonths: ["September 2026", "October 2026", "November 2026"],
    schoolFeedsConfigured: ["Holliston Public Schools (Elementary / Middle)"],
    alerts: [
      "School year starts soon — upcoming September 2026 lunch schedule PDF is needed.",
    ],
  };

  return {
    calendar: {
      activeRules: activeRules.map((r) => ({
        id: r.id,
        childName: r.childName,
        category: r.category,
        badgeText: r.badgeText,
        iconUrl: r.iconUrl,
        summaryPatterns: r.summaryPatterns,
        descriptionPatterns: r.descriptionPatterns,
      })),
      missingIconCategories,
      missingDetailsWarnings: missingDetailsWarnings.slice(0, 5),
      dadChecklist,
      evaluationWindow: {
        startDate: windowStart.toISOString(),
        endDate: windowEnd.toISOString(),
        totalEventsInWindow: upcoming30DayEvents.length,
      },
    },
    lunch: lunchHousekeeping,
    lastChecked: new Date().toISOString(),
  };
}
