export interface DailyLunchMenu {
  date: string; // YYYY-MM-DD
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  items: string[];
  isNoSchool: boolean;
  isEarlyRelease?: boolean;
  isFieldTrip?: boolean;
  isChefChoice?: boolean;
  isLastDay?: boolean;
  specialNote?: string;
}

export interface MonthlyLunchSchedule {
  title: string;
  month: string;
  year: number;
  schoolType: string;
  days: Record<string, DailyLunchMenu>;
}

export interface LunchDayResponse {
  today: DailyLunchMenu | null;
  tomorrow: DailyLunchMenu | null;
  nextSchoolDay: DailyLunchMenu | null;
  thisWeek: DailyLunchMenu[];
  activeScheduleMonth: string;
  isCurrentMonthLoaded: boolean;
  allDays: DailyLunchMenu[];
  lastUpdated: string;
}
