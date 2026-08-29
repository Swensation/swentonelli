/**
 * Date and Timezone Utilities for Eastern Time (America/New_York)
 * Safe for both Client Components and Server-Side execution.
 */

export function getEasternDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function formatEasternTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function getEasternMinutes(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value || 8);
  const m = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return h * 60 + m;
}

/**
 * Resolves the calendar date keys (YYYY-MM-DD) in America/New_York where an event is active.
 *
 * Implements majority-of-day logic and boundary intelligence:
 * 1. For all-day events (specified with YYYY-MM-DD or allDay flag), never let UTC midnight
 *    pull the event into the previous evening (e.g. 2026-09-04 00:00 UTC -> 8 PM Sept 3).
 * 2. If an event spans across midnight, evaluate the hours distribution:
 *    - Late-evening tails (< 6 hours, starting >= 6 PM Eastern) before an all-day span
 *      do NOT claim the previous day for all-day/school status.
 *    - Early-morning tails (< 6 hours, ending <= 6 AM Eastern) after an all-day span
 *      do NOT claim the next day.
 * 3. Multi-day custody/vacation spans covering full days are cleanly indexed across all days.
 */
export function getActiveEasternDatesForEvent(ev: {
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
}): string[] {
  const startDate = typeof ev.start === "string" ? new Date(ev.start) : ev.start;
  const endDate = ev.end
    ? typeof ev.end === "string"
      ? new Date(ev.end)
      : ev.end
    : startDate;

  // 1. All-Day or Date-Only Events
  if (ev.allDay) {
    const rawStartStr = typeof ev.start === "string" ? ev.start : ev.start.toISOString();
    const rawEndStr = ev.end
      ? typeof ev.end === "string"
        ? ev.end
        : ev.end.toISOString()
      : rawStartStr;

    const startIsoDate = rawStartStr.slice(0, 10);
    const endIsoDate = rawEndStr.slice(0, 10);

    const durationMs = endDate.getTime() - startDate.getTime();
    if (durationMs <= 24 * 3600 * 1000) {
      return [startIsoDate];
    }

    const dates: string[] = [];
    const [sYear, sMonth, sDay] = startIsoDate.split("-").map(Number);
    const [eYear, eMonth, eDay] = endIsoDate.split("-").map(Number);

    let curr = new Date(Date.UTC(sYear, sMonth - 1, sDay));
    const targetEnd = new Date(Date.UTC(eYear, eMonth - 1, eDay));

    while (curr < targetEnd) {
      const y = curr.getUTCFullYear();
      const m = String(curr.getUTCMonth() + 1).padStart(2, "0");
      const d = String(curr.getUTCDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    if (dates.length === 0) {
      dates.push(startIsoDate);
    }
    return dates;
  }

  // 2. Regular Timed Events
  const startKey = getEasternDateKey(startDate);
  const endKey = getEasternDateKey(endDate);

  if (startKey === endKey) {
    return [startKey];
  }

  // Event spans across midnight in Eastern Time.
  const dates: string[] = [];
  const startMinutes = getEasternMinutes(startDate);
  const endMinutes = getEasternMinutes(endDate);
  const totalDurationMs = endDate.getTime() - startDate.getTime();

  if (totalDurationMs < 6 * 3600 * 1000) {
    const minutesOnDay1 = 1440 - startMinutes;
    const minutesOnDay2 = endMinutes;
    if (minutesOnDay1 >= 60) dates.push(startKey);
    if (minutesOnDay2 >= 60) dates.push(endKey);
    if (dates.length === 0) dates.push(startKey);
    return dates;
  }

  // Multi-day timed event
  const parts = startKey.split("-").map(Number);
  let curr = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const endParts = endKey.split("-").map(Number);
  const targetEnd = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));

  while (curr <= targetEnd) {
    const y = curr.getUTCFullYear();
    const m = String(curr.getUTCMonth() + 1).padStart(2, "0");
    const d = String(curr.getUTCDate()).padStart(2, "0");
    const dayKey = `${y}-${m}-${d}`;

    if (dayKey === startKey) {
      const day1Hours = (1440 - startMinutes) / 60;
      if (day1Hours >= 4 || startKey === endKey) {
        dates.push(dayKey);
      }
    } else if (dayKey === endKey) {
      const lastDayHours = endMinutes / 60;
      if (lastDayHours >= 4) {
        dates.push(dayKey);
      }
    } else {
      dates.push(dayKey);
    }

    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  if (dates.length === 0) {
    dates.push(startKey);
  }
  return dates;
}

