import { loadEventRules } from "@/lib/eventRules";
import { fetchCalendarAgenda } from "@/lib/calendar";
import { getLunchForDates } from "@/lib/lunch";
import { DailyLunchMenu } from "@/types/lunch";

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
  dadChecklist: Array<{
    id: string;
    title: string;
    description: string;
    status: "done" | "pending";
    category: "calendar" | "lunch";
  }>;
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

  // Collect all event summaries across the entire 120-day calendar window
  const allEvents = Object.values(agenda.byDate).flat();

  // Identify sample events for known missing icon clusters
  const placentinoSamples: string[] = [];
  const adamsSamples: string[] = [];
  const fieldHockeySamples: string[] = [];
  const medicalSamples: string[] = [];

  allEvents.forEach((e) => {
    const sLower = (e.summary || "").toLowerCase();

    if (
      sLower.includes("katie pellegri") ||
      sLower.includes("placentino") ||
      sLower.includes("meet and greet") ||
      sLower.includes("elementary")
    ) {
      if (!placentinoSamples.includes(e.summary)) placentinoSamples.push(e.summary);
    } else if (
      sLower.includes("adams") ||
      sLower.includes("middle school") ||
      sLower.includes("8th grade")
    ) {
      if (!adamsSamples.includes(e.summary)) adamsSamples.push(e.summary);
    } else if (sLower.includes("field hockey") || sLower.includes("patoma")) {
      if (!fieldHockeySamples.includes(e.summary)) fieldHockeySamples.push(e.summary);
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

  const missingIconCategories = [
    {
      id: "placentino-school",
      name: "Placentino Elementary School (Holliston)",
      child: "Bennett & Brighton (Elementary)",
      description:
        "Elementary school meet-and-greets, teacher conferences, and school calendar events.",
      sampleEvents: placentinoSamples.slice(0, 3),
      suggestedIconPath: "/icons/schools/placentino.png",
      actionNeeded:
        "Provide Placentino School logo/crest image or URL to replace generic calendar icon.",
    },
    {
      id: "adams-middle-school",
      name: "Adams Middle School (Holliston)",
      child: "Aria & Brighton (Middle School)",
      description:
        "Middle school orientation, 6th/7th/8th grade events, and Adams school schedules.",
      sampleEvents: adamsSamples.slice(0, 3),
      suggestedIconPath: "/icons/schools/adams.png",
      actionNeeded:
        "Provide Adams Middle School logo/crest image or URL to replace generic calendar icon.",
    },
    {
      id: "brighton-field-hockey",
      name: "Brighton Field Hockey / Softball",
      child: "Brighton",
      description: "Patoma field practices, town league games, and tournaments.",
      sampleEvents: fieldHockeySamples.slice(0, 3),
      suggestedIconPath: "/icons/teams/brighton_field_hockey.png",
      actionNeeded:
        "Provide team logo or emblem for Brighton's Field Hockey & Softball team.",
    },
    {
      id: "pediatric-medical",
      name: "Pediatric & Dental Checkups",
      child: "All Children",
      description: "Annual well visits, dental cleanings, orthodontist checkups.",
      sampleEvents: medicalSamples.slice(0, 3),
      suggestedIconPath: "/icons/general/medical.png",
      actionNeeded: "Assign custom health/medical icon rule for pediatric appointments.",
    },
  ];

  const dadChecklist = [
    {
      id: "task-osfc",
      title: "Aria OSFC Soccer Crest",
      description: "Old School Football Club logo configured and active.",
      status: "done" as const,
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
      id: "task-adams",
      title: "Add Adams Middle School Icon",
      description:
        "Find and add Adams Middle School (Holliston) emblem for Aria/Brighton.",
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
      dadChecklist,
    },
    lunch: lunchHousekeeping,
    lastChecked: new Date().toISOString(),
  };
}
