import { CalendarAgenda, CalendarEvent } from "@/types/calendar";
import { DailyLunchMenu, LunchDayResponse } from "@/types/lunch";
import { addDays, format, setHours, setMinutes } from "date-fns";

export function getMockCalendarAgenda(): CalendarAgenda {
  const now = new Date();
  const todayKey = format(now, "yyyy-MM-dd");
  const tomorrowKey = format(addDays(now, 1), "yyyy-MM-dd");

  const todayEvents: CalendarEvent[] = [
    {
      id: "evt-1",
      summary: "Kids School Drop-off",
      start: setMinutes(setHours(now, 8), 15).toISOString(),
      end: setMinutes(setHours(now, 8), 45).toISOString(),
      allDay: false,
      sourceId: "family",
      sourceName: "Family Shared",
      color: "#3b82f6",
      location: "Elementary School",
    },
    {
      id: "evt-2",
      summary: "Dad Team Sync & Sprint Review",
      start: setMinutes(setHours(now, 10), 0).toISOString(),
      end: setMinutes(setHours(now, 11), 0).toISOString(),
      allDay: false,
      sourceId: "work",
      sourceName: "Work / Dev",
      color: "#8b5cf6",
    },
    {
      id: "evt-3",
      summary: "Soccer Practice (Field 3)",
      start: setMinutes(setHours(now, 16), 30).toISOString(),
      end: setMinutes(setHours(now, 17), 45).toISOString(),
      allDay: false,
      sourceId: "activities",
      sourceName: "Sports & Activities",
      color: "#10b981",
      location: "Town Memorial Field",
    },
    {
      id: "evt-4",
      summary: "Family Dinner & Movie Night 🍕",
      start: setMinutes(setHours(now, 18), 30).toISOString(),
      end: setMinutes(setHours(now, 20), 30).toISOString(),
      allDay: false,
      sourceId: "family",
      sourceName: "Family Shared",
      color: "#3b82f6",
    },
  ];

  const tomorrowEvents: CalendarEvent[] = [
    {
      id: "evt-5",
      summary: "Swim Lessons",
      start: setMinutes(setHours(addDays(now, 1), 9), 0).toISOString(),
      end: setMinutes(setHours(addDays(now, 1), 10), 0).toISOString(),
      allDay: false,
      sourceId: "activities",
      sourceName: "Sports & Activities",
      color: "#10b981",
      location: "Community Pool",
    },
    {
      id: "evt-6",
      summary: "Grocery Run / Farmers Market",
      start: setMinutes(setHours(addDays(now, 1), 11), 30).toISOString(),
      end: setMinutes(setHours(addDays(now, 1), 12), 45).toISOString(),
      allDay: false,
      sourceId: "family",
      sourceName: "Family Shared",
      color: "#3b82f6",
    },
    {
      id: "evt-7",
      summary: "Piano Lesson",
      start: setMinutes(setHours(addDays(now, 1), 15), 0).toISOString(),
      end: setMinutes(setHours(addDays(now, 1), 15), 45).toISOString(),
      allDay: false,
      sourceId: "activities",
      sourceName: "Sports & Activities",
      color: "#10b981",
    },
  ];

  const upcoming = [
    {
      date: format(addDays(now, 2), "yyyy-MM-dd"),
      dateFormatted: format(addDays(now, 2), "EEEE, MMM d"),
      events: [
        {
          id: "evt-8",
          summary: "Karate Belt Testing",
          start: setMinutes(setHours(addDays(now, 2), 16), 0).toISOString(),
          end: setMinutes(setHours(addDays(now, 2), 17), 30).toISOString(),
          allDay: false,
          sourceId: "activities",
          sourceName: "Sports & Activities",
          color: "#10b981",
        },
      ],
    },
    {
      date: format(addDays(now, 3), "yyyy-MM-dd"),
      dateFormatted: format(addDays(now, 3), "EEEE, MMM d"),
      events: [
        {
          id: "evt-9",
          summary: "School Science Fair 🔬",
          start: setMinutes(setHours(addDays(now, 3), 18), 0).toISOString(),
          end: setMinutes(setHours(addDays(now, 3), 20), 0).toISOString(),
          allDay: false,
          sourceId: "school",
          sourceName: "School",
          color: "#f59e0b",
        },
      ],
    },
  ];

  const byDate: Record<string, CalendarEvent[]> = {
    [todayKey]: todayEvents,
    [tomorrowKey]: tomorrowEvents,
    [format(addDays(now, 2), "yyyy-MM-dd")]: upcoming[0].events,
    [format(addDays(now, 3), "yyyy-MM-dd")]: upcoming[1].events,
  };

  return {
    today: todayEvents,
    tomorrow: tomorrowEvents,
    upcoming,
    byDate,
    lastUpdated: new Date().toISOString(),
  };
}

export function getMockLunchData(): LunchDayResponse {
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");

  const todayMenu: DailyLunchMenu = {
    date: todayStr,
    dayOfWeek: "Tuesday",
    items: [
      "Hamburger or Cheeseburger",
      "Cucumber Salad",
      "Pickles"
    ],
    isNoSchool: false,
  };

  const tomorrowMenu: DailyLunchMenu = {
    date: tomorrowStr,
    dayOfWeek: "Wednesday",
    items: [
      "Pancakes with Chicken Sausage Patty",
      "Red Peppers"
    ],
    isNoSchool: false,
  };

  const allDays: DailyLunchMenu[] = [
    {
      date: todayStr,
      dayOfWeek: "Monday",
      items: [
        "BBQ Chicken Nuggets",
        "Mashed Potatoes",
        "Corn"
      ],
      isNoSchool: false,
    },
    todayMenu,
    tomorrowMenu,
    {
      date: format(addDays(now, 2), "yyyy-MM-dd"),
      dayOfWeek: "Thursday",
      items: [
        "Waffles with Chicken Sausage Patty",
        "Dragon Juice",
        "Red Peppers"
      ],
      isNoSchool: false,
    },
    {
      date: format(addDays(now, 3), "yyyy-MM-dd"),
      dayOfWeek: "Friday",
      items: [
        "Pizza",
        "Finley Salad"
      ],
      isNoSchool: false,
    },
  ];

  return {
    today: todayMenu,
    tomorrow: tomorrowMenu,
    nextSchoolDay: tomorrowMenu,
    thisWeek: allDays,
    activeScheduleMonth: "Sample / Demo Menu",
    isCurrentMonthLoaded: true,
    allDays,
    lastUpdated: new Date().toISOString(),
  };
}
