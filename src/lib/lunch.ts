import { DailyLunchMenu, LunchDayResponse, MonthlyLunchSchedule } from "@/types/lunch";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import fs from "fs";
import path from "path";

export function loadLunchSchedule(): MonthlyLunchSchedule | null {
  try {
    const filePath = path.join(process.cwd(), "data", "lunch_schedule.json");
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyLunchSchedule;
  } catch (err) {
    console.error("Failed to read lunch_schedule.json:", err);
    return null;
  }
}

export const CHILD_SCHOOL_MAP: Record<
  string,
  { schoolId: string; schoolName: string; schoolType: "elementary" | "secondary" | "millis" }
> = {
  bennett: {
    schoolId: "miller",
    schoolName: "Miller Elementary School",
    schoolType: "elementary",
  },
  brighton: {
    schoolId: "adams",
    schoolName: "Robert Adams Middle School (RAMS)",
    schoolType: "secondary",
  },
  aria: {
    schoolId: "millis",
    schoolName: "Millis Middle School",
    schoolType: "millis",
  },
  benjamin: {
    schoolId: "cfb",
    schoolName: "Clyde F. Brown Elementary (CFB)",
    schoolType: "millis",
  },
};

export function getChildLunchMenu(
  childId: string,
  targetDate: Date | string = new Date()
): DailyLunchMenu | null {
  const schedule = loadLunchSchedule();
  if (!schedule) return null;

  const dateStr =
    typeof targetDate === "string"
      ? targetDate.slice(0, 10)
      : format(targetDate, "yyyy-MM-dd");

  const childKey = childId.toLowerCase().trim();
  const mapping = CHILD_SCHOOL_MAP[childKey];

  if (!mapping) return null;

  let menu: DailyLunchMenu | null = null;

  if (mapping.schoolType === "elementary") {
    menu = schedule.elementary?.days?.[dateStr] || schedule.days?.[dateStr] || null;
  } else if (mapping.schoolType === "secondary") {
    menu = schedule.secondary?.days?.[dateStr] || null;
  }

  if (!menu || menu.isNoSchool || !menu.items || menu.items.length === 0) {
    return null;
  }

  return {
    ...menu,
    schoolName: mapping.schoolName,
    schoolType: mapping.schoolType,
  };
}

export function getLunchForDates(targetDate: Date = new Date()): LunchDayResponse {
  const schedule = loadLunchSchedule();

  if (!schedule || !schedule.days) {
    return {
      today: null,
      tomorrow: null,
      nextSchoolDay: null,
      thisWeek: [],
      activeScheduleMonth: "None",
      isCurrentMonthLoaded: false,
      allDays: [],
      elementary: {},
      secondary: {},
      byChild: {
        bennett: null,
        brighton: null,
        aria: null,
        benjamin: null,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  const dateStr = format(targetDate, "yyyy-MM-dd");
  const tomorrowDate = addDays(targetDate, 1);
  const tomorrowStr = format(tomorrowDate, "yyyy-MM-dd");

  const todayMenu = schedule.days[dateStr] || null;
  const tomorrowMenu = schedule.days[tomorrowStr] || null;

  // Find next school day if within range
  let nextSchoolDay: DailyLunchMenu | null = null;
  for (let i = 1; i <= 14; i++) {
    const checkDate = addDays(targetDate, i);
    const checkStr = format(checkDate, "yyyy-MM-dd");
    const menu = schedule.days[checkStr];
    if (menu && !menu.isNoSchool) {
      nextSchoolDay = menu;
      break;
    }
  }

  // Get days for this current calendar week (Mon-Fri)
  const monday = startOfWeek(targetDate, { weekStartsOn: 1 });
  const thisWeek: DailyLunchMenu[] = [];
  for (let i = 0; i < 5; i++) {
    const dayDate = addDays(monday, i);
    const dayStr = format(dayDate, "yyyy-MM-dd");
    if (schedule.days[dayStr]) {
      thisWeek.push(schedule.days[dayStr]);
    }
  }

  const allDaysList = Object.values(schedule.days).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const currentMonthKey = format(targetDate, "yyyy-MM");
  const scheduleMonthKey = `${schedule.year || 2026}-${schedule.month === "June" ? "06" : "09"}`;
  const isCurrentMonthLoaded = currentMonthKey === scheduleMonthKey;

  const elementaryDays = schedule.elementary?.days || schedule.days || {};
  const secondaryDays = schedule.secondary?.days || {};

  return {
    today: todayMenu,
    tomorrow: tomorrowMenu,
    nextSchoolDay,
    thisWeek,
    activeScheduleMonth: `${schedule.month || "September"} ${schedule.year || 2026}`,
    isCurrentMonthLoaded,
    allDays: allDaysList,
    elementary: elementaryDays,
    secondary: secondaryDays,
    byChild: {
      bennett: getChildLunchMenu("bennett", targetDate),
      brighton: getChildLunchMenu("brighton", targetDate),
      aria: getChildLunchMenu("aria", targetDate),
      benjamin: getChildLunchMenu("benjamin", targetDate),
    },
    lastUpdated: new Date().toISOString(),
  };
}
