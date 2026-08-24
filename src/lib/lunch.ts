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
  const scheduleMonthKey = `${schedule.year}-${schedule.month === "June" ? "06" : "09"}`;
  const isCurrentMonthLoaded = currentMonthKey === scheduleMonthKey;

  return {
    today: todayMenu,
    tomorrow: tomorrowMenu,
    nextSchoolDay,
    thisWeek,
    activeScheduleMonth: `${schedule.month} ${schedule.year}`,
    isCurrentMonthLoaded,
    allDays: allDaysList,
    lastUpdated: new Date().toISOString(),
  };
}
