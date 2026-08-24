import { loadEventRules } from "@/lib/eventRules";
import { fetchCalendarAgenda } from "@/lib/calendar";
import { getLunchForDates } from "@/lib/lunch";
import { DailyLunchMenu } from "@/types/lunch";
import { discoverIconForEventGroup, DiscoveredIconSuggestion } from "@/lib/iconDiscovery";
import { addDays, endOfDay, format, isAfter, isBefore, isWeekend, parseISO, startOfDay } from "date-fns";
import fs from "fs";
import path from "path";

export interface MissingIconItem {
  id: string;
  summaryGroup: string;
  countIn30Days: number;
  childName?: string;
  sampleEvents: string[];
  suggestedAction: string;
  suggestion?: DiscoveredIconSuggestion | null;
}

export interface MissingDetailWarning {
  id: string;
  type: "missing_location" | "unassigned_child" | "uncategorized";
  title: string;
  eventSummary: string;
  eventDate: string;
  detail: string;
}

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
  missingIcons: MissingIconItem[];
  missingDetailsWarnings: MissingDetailWarning[];
  dadChecklist: Array<{
    id: string;
    title: string;
    description: string;
    status: "done" | "pending";
    category: "calendar" | "lunch" | "children";
  }>;
  evaluationWindow: {
    startDate: string;
    endDate: string;
    totalEventsInWindow: number;
    eventsWithCustomIcons: number;
    eventsWithoutCustomIcons: number;
  };
}

export interface AdminLunchHousekeeping {
  activeMonth: string;
  totalDays: number;
  cleanIntegrityPass: boolean;
  thirtyDaySchoolDaysTotal: number;
  thirtyDaySchoolDaysCovered: number;
  upcomingMissingMonths: string[];
  schoolFeedsConfigured: string[];
  alerts: string[];
}

export interface AdminGeneralOverview {
  systemStatus: "healthy" | "warning";
  serverTime: string;
  kioskUrl: string;
  lanIp: string;
  totalActiveFeeds: number;
  calendarAlertsCount: number;
  lunchAlertsCount: number;
  quickStats: {
    activeEventRulesCount: number;
    eventsInNext30Days: number;
    lunchScheduleStatus: string;
  };
}

export interface AdminDashboardData {
  general: AdminGeneralOverview;
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

  // Dynamic Missing Icons Scanner:
  // Find every event in the 30-day window that does not have an explicit custom iconUrl
  const uncustomizedEvents = upcoming30DayEvents.filter(
    (e) => !e.enrichment?.iconUrl
  );

  // Group uncustomized events by standardized normalized title
  const groups: Record<string, { count: number; child?: string; samples: string[] }> = {};

  uncustomizedEvents.forEach((e) => {
    // Simplify summary for clustering
    const raw = e.summary || "Untitled Event";
    let clusterKey = raw
      .replace(/\b(U\d+|Girls|Boys|Grade \d+|vs\.?|@.*)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (clusterKey.length < 3) clusterKey = raw;

    if (!groups[clusterKey]) {
      groups[clusterKey] = {
        count: 0,
        child: e.enrichment?.child?.name,
        samples: [],
      };
    }
    groups[clusterKey].count++;
    if (!groups[clusterKey].samples.includes(raw) && groups[clusterKey].samples.length < 3) {
      groups[clusterKey].samples.push(raw);
    }
  });

  const missingIcons: MissingIconItem[] = Object.entries(groups)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, info], idx) => {
      const suggestion = discoverIconForEventGroup(key, info.samples);
      return {
        id: `missing-icon-${idx}`,
        summaryGroup: key,
        countIn30Days: info.count,
        childName: info.child,
        sampleEvents: info.samples,
        suggestedAction: suggestion
          ? `AI Discovered Candidate: ${suggestion.category} (${suggestion.sourceDomain || "verified"})`
          : `Provide custom icon or image URL to replace generic calendar icon for "${key}".`,
        suggestion,
      };
    });

  // Scan for missing locations on matches, games, or appointments in next 30 days
  const missingDetailsWarnings: MissingDetailWarning[] = [];
  upcoming30DayEvents.forEach((e) => {
    const sLower = (e.summary || "").toLowerCase();
    if (
      !e.location &&
      (sLower.includes("game") ||
        sLower.includes("vs ") ||
        sLower.includes("tournament") ||
        sLower.includes("doctor") ||
        sLower.includes("dr.") ||
        sLower.includes("visit"))
    ) {
      missingDetailsWarnings.push({
        id: `loc-${e.id}`,
        type: "missing_location",
        title: "Missing Location / Address",
        eventSummary: e.summary,
        eventDate: e.start,
        detail: "Event has no field or address attached in Google Calendar.",
      });
    }
  });

  // Calculate 30-Day School Lunch Coverage
  let thirtyDaySchoolDaysTotal = 0;
  let thirtyDaySchoolDaysCovered = 0;
  for (let i = 0; i < 30; i++) {
    const day = addDays(windowStart, i);
    if (!isWeekend(day)) {
      thirtyDaySchoolDaysTotal++;
      const dayKey = format(day, "yyyy-MM-dd");
      const hasMenu = lunchData.allDays.some((d: DailyLunchMenu) => d.date === dayKey);
      if (hasMenu) thirtyDaySchoolDaysCovered++;
    }
  }

  // Check child icons status
  const hasAriaIcon = fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "aria.png"));
  const hasBrightonIcon = fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "brighton.png"));
  const hasBenjaminIcon = fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "benjamin.png"));
  const hasBennettIcon = fs.existsSync(path.join(process.cwd(), "public", "icons", "children", "bennett.png"));

  const hasAdamsIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "schools", "adams.png")
  );

  const hasBrightonFieldHockeyIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "teams", "brighton_field_hockey.png")
  );

  const hasMillerIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "schools", "miller.png")
  );

  const hasTherapyIcon = fs.existsSync(
    path.join(process.cwd(), "public", "icons", "general", "therapy.png")
  );

  const dadChecklist = [
    // Team & School Crests
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
      description: "Adams Middle School (Holliston) Rams crest configured and active.",
      status: (hasAdamsIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-brighton-fh",
      title: "Brighton Holliston Field Hockey Crest",
      description: "Holliston Field Hockey crossed-sticks emblem extracted and active.",
      status: (hasBrightonFieldHockeyIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-miller",
      title: "Miller Elementary School Logo",
      description: "Miller Elementary School (Holliston) logo configured and active.",
      status: (hasMillerIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-therapy",
      title: "Brighton & Aria Therapy Icon",
      description: "Therapy clinic logo configured and active.",
      status: (hasTherapyIcon ? "done" : "pending") as "done" | "pending",
      category: "calendar" as const,
    },
    {
      id: "task-placentino",
      title: "Add Placentino School Icon",
      description: "Find and add Placentino Elementary School emblem for Bennett/Brighton.",
      status: "pending" as const,
      category: "calendar" as const,
    },
    // Child Specific Avatar Icons
    {
      id: "task-child-aria",
      title: "Aria's Personal Profile Icon",
      description: "Provide photo or custom avatar icon for Aria.",
      status: (hasAriaIcon ? "done" : "pending") as "done" | "pending",
      category: "children" as const,
    },
    {
      id: "task-child-brighton",
      title: "Brighton's Personal Profile Icon",
      description: "Provide photo or custom avatar icon for Brighton.",
      status: (hasBrightonIcon ? "done" : "pending") as "done" | "pending",
      category: "children" as const,
    },
    {
      id: "task-child-benjamin",
      title: "Benjamin's Personal Profile Icon",
      description: "Provide photo or custom avatar icon for Benjamin.",
      status: (hasBenjaminIcon ? "done" : "pending") as "done" | "pending",
      category: "children" as const,
    },
    {
      id: "task-child-bennett",
      title: "Bennett's Personal Profile Icon",
      description: "Provide photo or custom avatar icon for Bennett.",
      status: (hasBennettIcon ? "done" : "pending") as "done" | "pending",
      category: "children" as const,
    },
    // Lunch Schedule
    {
      id: "task-sept-lunch",
      title: "Upload September 2026 Lunch Menu",
      description: "Upload the upcoming September 2026 school lunch PDF to data/ for automatic ingestion.",
      status: "pending" as const,
      category: "lunch" as const,
    },
  ];

  // School Lunch Housekeeping
  const lunchHousekeeping: AdminLunchHousekeeping = {
    activeMonth: lunchData.activeScheduleMonth,
    totalDays: lunchData.allDays.length,
    cleanIntegrityPass: !lunchData.allDays.some((d: DailyLunchMenu) =>
      d.items.some((item: string) => item.includes("(V)"))
    ),
    thirtyDaySchoolDaysTotal,
    thirtyDaySchoolDaysCovered,
    upcomingMissingMonths: ["September 2026", "October 2026", "November 2026"],
    schoolFeedsConfigured: ["Holliston Public Schools (Elementary / Middle)"],
    alerts:
      thirtyDaySchoolDaysCovered < thirtyDaySchoolDaysTotal
        ? [`Only ${thirtyDaySchoolDaysCovered} of ${thirtyDaySchoolDaysTotal} upcoming school weekdays in the next 30 days have lunch menus loaded.`]
        : [],
  };

  const calendarAlertsCount = missingIcons.length + missingDetailsWarnings.length;
  const lunchAlertsCount = lunchHousekeeping.alerts.length;

  const general: AdminGeneralOverview = {
    systemStatus: calendarAlertsCount + lunchAlertsCount > 0 ? "warning" : "healthy",
    serverTime: new Date().toISOString(),
    kioskUrl: "http://192.168.86.236:3000",
    lanIp: "192.168.86.236",
    totalActiveFeeds: 3,
    calendarAlertsCount,
    lunchAlertsCount,
    quickStats: {
      activeEventRulesCount: activeRules.length,
      eventsInNext30Days: upcoming30DayEvents.length,
      lunchScheduleStatus: `${lunchData.activeScheduleMonth} (${lunchData.allDays.length} days loaded)`,
    },
  };

  return {
    general,
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
      missingIcons,
      missingDetailsWarnings: missingDetailsWarnings.slice(0, 10),
      dadChecklist,
      evaluationWindow: {
        startDate: windowStart.toISOString(),
        endDate: windowEnd.toISOString(),
        totalEventsInWindow: upcoming30DayEvents.length,
        eventsWithCustomIcons: upcoming30DayEvents.length - uncustomizedEvents.length,
        eventsWithoutCustomIcons: uncustomizedEvents.length,
      },
    },
    lunch: lunchHousekeeping,
    lastChecked: new Date().toISOString(),
  };
}
