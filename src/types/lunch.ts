export interface DailyLunchMenu {
  date: string; // YYYY-MM-DD
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  items: string[];
  isNoSchool: boolean;
  isEarlyRelease?: boolean;
  isFieldTrip?: boolean;
  isChefChoice?: boolean;
  isLastDay?: boolean;
  isVegetarian?: boolean;
  specialNote?: string;
  schoolName?: string;
  schoolType?: string;
}

export interface SchoolLunchSchedule {
  schoolType: string;
  schools: string[];
  grades?: string;
  days: Record<string, DailyLunchMenu>;
}

export interface MonthlyLunchSchedule {
  title: string;
  month?: string;
  year?: number;
  schoolType?: string;
  source?: string;
  elementary?: SchoolLunchSchedule;
  secondary?: SchoolLunchSchedule;
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
  elementary?: Record<string, DailyLunchMenu>;
  secondary?: Record<string, DailyLunchMenu>;
  byChild?: Record<string, DailyLunchMenu | null>;
  lastUpdated: string;
}
