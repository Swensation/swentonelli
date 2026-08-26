import { CalendarAgenda, CalendarEvent, CalendarSource } from "@/types/calendar";
import { getMockCalendarAgenda } from "@/lib/mockData";
import { enrichCalendarEvent } from "@/lib/eventRules";
import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import ical from "node-ical";
import fs from "fs";
import path from "path";

// Default color palette for multiple calendars
const CALENDAR_COLORS = [
  "#3b82f6", // blue
  "#f97316", // orange
  "#10b981", // green
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#14b8a6", // teal
];

// Ensure server environment runs in pure UTC so rrule expansion and dates are identical across dev and prod
process.env.TZ = "UTC";

// In-memory cache for live polling
let cachedAgenda: { data: CalendarAgenda; timestamp: number } | null = null;
const CACHE_TTL_MS = 20 * 1000; // 20 seconds cache

import { getEasternDateKey, formatEasternTime } from "@/lib/dateUtils";

export function isDateExcluded(date: Date, exdate?: Record<string, any>): boolean {
  if (!exdate) return false;
  const dIso = date.toISOString().slice(0, 10);
  for (const k in exdate) {
    if (k.startsWith(dIso)) return true;
    const ex = exdate[k];
    if (ex instanceof Date) {
      if (ex.toISOString().slice(0, 10) === dIso) return true;
      if (Math.abs(ex.getTime() - date.getTime()) < 60 * 1000) return true;
    }
  }
  return false;
}

function sanitizeIcsUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("webcal://")) {
    return "https://" + trimmed.slice(9);
  }
  return trimmed;
}

export function buildGoogleCalendarDirectUrl(ev: {
  uid?: string;
  summary: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
}): string {
  const startDate = typeof ev.start === "string" ? new Date(ev.start) : ev.start;

  // Jump directly to that specific day in Google Calendar web app (100% immune to 400/500 eid errors)
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1;
  const day = startDate.getDate();
  return `https://calendar.google.com/calendar/u/0/r/day/${year}/${month}/${day}`;
}

export { getEasternDateKey, formatEasternTime };

export function parseCalendarSourcesFromEnv(): CalendarSource[] {
  const sources: CalendarSource[] = [];

  // 1. Primary Source of Truth: config/calendars.json (version-controlled, auto-deployed to cloud)
  try {
    const configPath = path.join(process.cwd(), "config", "calendars.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((src, idx) => {
          if (src && src.icsUrl && src.icsUrl.trim() !== "") {
            sources.push({
              id: src.id || `cal-${idx + 1}`,
              name: src.name || `Calendar ${idx + 1}`,
              color: src.color || CALENDAR_COLORS[idx % CALENDAR_COLORS.length],
              icsUrl: sanitizeIcsUrl(src.icsUrl),
            });
          }
        });
      }
    }
  } catch (err) {
    console.error("Failed to read config/calendars.json:", err);
  }

  // 2. Optional Environment Variable overrides: GOOGLE_CALENDAR_SOURCES
  if (process.env.GOOGLE_CALENDAR_SOURCES) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_CALENDAR_SOURCES);
      if (Array.isArray(parsed)) {
        parsed.forEach((src, idx) => {
          if (src && src.icsUrl && src.icsUrl.trim() !== "") {
            const sanitized = sanitizeIcsUrl(src.icsUrl);
            if (!sources.some((s) => s.icsUrl === sanitized)) {
              sources.push({
                id: src.id || `env-cal-${idx + 1}`,
                name: src.name || `Calendar ${idx + 1}`,
                color: src.color || CALENDAR_COLORS[(sources.length + idx) % CALENDAR_COLORS.length],
                icsUrl: sanitized,
              });
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse GOOGLE_CALENDAR_SOURCES JSON", e);
    }
  }

  // 3. Optional Environment Variable overrides: GOOGLE_CALENDAR_ICAL_URL
  if (process.env.GOOGLE_CALENDAR_ICAL_URL) {
    const rawUrls = process.env.GOOGLE_CALENDAR_ICAL_URL.split(/[\n,]+/);
    rawUrls.forEach((rawUrl, idx) => {
      const cleaned = sanitizeIcsUrl(rawUrl);
      if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
        if (!sources.some((s) => s.icsUrl === cleaned)) {
          const color =
            idx === 0 && process.env.GOOGLE_CALENDAR_COLOR
              ? process.env.GOOGLE_CALENDAR_COLOR
              : CALENDAR_COLORS[(sources.length + idx) % CALENDAR_COLORS.length];

          const name =
            idx === 0 && process.env.GOOGLE_CALENDAR_NAME
              ? process.env.GOOGLE_CALENDAR_NAME
              : `Calendar ${sources.length + 1}`;

          sources.push({
            id: `env-cal-${sources.length + 1}`,
            name,
            color,
            icsUrl: cleaned,
          });
        }
      }
    });
  }

  return sources;
}

export async function fetchCalendarAgenda(): Promise<CalendarAgenda> {
  const now = new Date();

  // Return cached result if fresh
  if (cachedAgenda && Date.now() - cachedAgenda.timestamp < CACHE_TTL_MS) {
    return cachedAgenda.data;
  }

  const sources = parseCalendarSourcesFromEnv();

  // If no live sources are configured, return friendly mock demo data
  if (sources.length === 0) {
    const mock = getMockCalendarAgenda();
    cachedAgenda = { data: mock, timestamp: Date.now() };
    return mock;
  }

  // Support 60 days in the past and 60 days in the future for rich timeline browsing
  const rangeStart = startOfDay(addDays(now, -60));
  const rangeEnd = endOfDay(addDays(now, 60));
  const allEvents: CalendarEvent[] = [];

  // Fetch all calendar feeds in parallel
  await Promise.all(
    sources.map(async (source, sourceIdx) => {
      if (!source.icsUrl) return;

      try {
        const icsData = await ical.async.fromURL(source.icsUrl);

        for (const k in icsData) {
          if (!Object.prototype.hasOwnProperty.call(icsData, k)) continue;
          const ev = icsData[k];
          if (!ev || ev.type !== "VEVENT") continue;

          const summary = ev.summary || "Untitled Event";
          const description = ev.description ? String(ev.description) : undefined;
          const location = ev.location ? String(ev.location) : undefined;
          const eventUrl = ev.url ? String(ev.url) : undefined;
          const color = source.color || CALENDAR_COLORS[sourceIdx % CALENDAR_COLORS.length];

          // Enrich with business rules (child detection, category, team crest)
          const enrichment = enrichCalendarEvent({
            summary,
            description,
            sourceName: source.name,
          });

          // Handle regular (non-recurring) event
          if (ev.start && !ev.rrule) {
            const startDate = new Date(ev.start);
            const endDate = ev.end ? new Date(ev.end) : startDate;
            const allDay =
              Boolean((ev.start as any)?.dateOnly) ||
              (ev as any).datetype === "date" ||
              endDate.getTime() - startDate.getTime() >= 23 * 3600 * 1000;

            const directUrl = buildGoogleCalendarDirectUrl({
              uid: ev.uid || k,
              summary,
              start: startDate,
              end: endDate,
              allDay,
            });

            if (isAfter(endDate, rangeStart) && isBefore(startDate, rangeEnd)) {
              allEvents.push({
                id: `${source.id}-${ev.uid || k}-${startDate.getTime()}`,
                summary,
                description,
                location,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay,
                sourceId: source.id,
                sourceName: source.name,
                color,
                url: directUrl,
                enrichment,
              });
            }
          } else if (ev.rrule) {
            // Recurring event expansion using RRULE
            try {
              const dates = ev.rrule.between(rangeStart, rangeEnd, true);
              const duration =
                ev.end && ev.start ? ev.end.getTime() - ev.start.getTime() : 3600 * 1000;

              for (const d of dates) {
                const startDate = d;
                const endDate = new Date(d.getTime() + duration);
                const allDay =
                  Boolean((ev.start as any)?.dateOnly) ||
                  (ev as any).datetype === "date";

                // 1. Skip occurrences deleted in Google Calendar (EXDATE)
                if (isDateExcluded(startDate, ev.exdate)) {
                  continue;
                }

                // 2. Check for recurrence overrides (modified single instances)
                const dKey = getEasternDateKey(startDate);
                const override =
                  ev.recurrences?.[dKey] ||
                  ev.recurrences?.[startDate.toISOString().slice(0, 10)];

                if (override) {
                  if (override.status === "CANCELLED") {
                    continue;
                  }
                  const overrideStart = override.start ? new Date(override.start) : startDate;
                  const overrideEnd = override.end ? new Date(override.end) : endDate;
                  const overrideSummary = override.summary || summary;
                  const overrideDescription = override.description ? String(override.description) : description;
                  const overrideLocation = override.location ? String(override.location) : location;

                  const directUrl = buildGoogleCalendarDirectUrl({
                    uid: override.uid || ev.uid || k,
                    summary: overrideSummary,
                    start: overrideStart,
                    end: overrideEnd,
                    allDay,
                  });

                  allEvents.push({
                    id: `${source.id}-${ev.uid || k}-${overrideStart.getTime()}`,
                    summary: overrideSummary,
                    description: overrideDescription,
                    location: overrideLocation,
                    start: overrideStart.toISOString(),
                    end: overrideEnd.toISOString(),
                    allDay,
                    sourceId: source.id,
                    sourceName: source.name,
                    color,
                    url: directUrl,
                    enrichment: enrichCalendarEvent({
                      summary: overrideSummary,
                      description: overrideDescription,
                      sourceName: source.name,
                    }),
                  });
                  continue;
                }

                const directUrl = buildGoogleCalendarDirectUrl({
                  uid: ev.uid || k,
                  summary,
                  start: startDate,
                  end: endDate,
                  allDay,
                });

                allEvents.push({
                  id: `${source.id}-${ev.uid || k}-${startDate.getTime()}`,
                  summary,
                  description,
                  location,
                  start: startDate.toISOString(),
                  end: endDate.toISOString(),
                  allDay,
                  sourceId: source.id,
                  sourceName: source.name,
                  color,
                  url: directUrl,
                  enrichment,
                });
              }
            } catch (rruleErr) {
              console.error("Failed to expand RRULE for event:", summary, rruleErr);
            }
          }
        }
      } catch (err: any) {
        console.error(`Failed to fetch calendar feed (${source.name}):`, err.message);
      }
    })
  );

  // Chronologically sort all aggregated events
  allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Calculate live countdowns and happening now
  const enrichedEvents = allEvents.map((ev) => {
    const start = new Date(ev.start).getTime();
    const end = new Date(ev.end).getTime();
    const nowTime = now.getTime();

    const isHappeningNow = nowTime >= start && nowTime <= end;
    const minutesUntilStart =
      start > nowTime ? Math.round((start - nowTime) / (60 * 1000)) : undefined;

    return {
      ...ev,
      isHappeningNow,
      minutesUntilStart,
    };
  });

  // Index events into byDate map in America/New_York Eastern Time
  const byDate: Record<string, CalendarEvent[]> = {};

  enrichedEvents.forEach((ev) => {
    try {
      const startDate = new Date(ev.start);
      const endDate = new Date(ev.end);
      const startKey = ev.allDay ? ev.start.slice(0, 10) : getEasternDateKey(startDate);
      const endKey = ev.allDay ? ev.end.slice(0, 10) : getEasternDateKey(endDate);

      // Multi-day all-day events (e.g. custody blocks or vacation weeks) are indexed on each day
      if (ev.allDay && startKey !== endKey) {
        let curr = new Date(startDate);
        while (isBefore(curr, endDate)) {
          const key = curr.toISOString().slice(0, 10);
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push(ev);
          curr = addDays(curr, 1);
        }
      } else {
        if (!byDate[startKey]) {
          byDate[startKey] = [];
        }
        byDate[startKey].push(ev);
      }
    } catch {
      // ignore parse error
    }
  });

  const todayStr = getEasternDateKey(now);
  const tomorrowStr = getEasternDateKey(addDays(now, 1));

  const todayEvents = byDate[todayStr] || [];
  const tomorrowEvents = byDate[tomorrowStr] || [];

  // Group upcoming by next 7 days for quick preview
  const upcomingGrouped: { date: string; dateFormatted: string; events: CalendarEvent[] }[] = [];
  for (let i = 2; i <= 7; i++) {
    const day = addDays(now, i);
    const dayKey = format(day, "yyyy-MM-dd");
    const dayFormatted = format(day, "EEEE, MMMM d");
    const eventsForDay = byDate[dayKey] || [];
    if (eventsForDay.length > 0) {
      upcomingGrouped.push({
        date: dayKey,
        dateFormatted: dayFormatted,
        events: eventsForDay,
      });
    }
  }

  const agendaData: CalendarAgenda = {
    today: todayEvents,
    tomorrow: tomorrowEvents,
    upcoming: upcomingGrouped,
    byDate,
    lastUpdated: now.toISOString(),
  };

  cachedAgenda = { data: agendaData, timestamp: Date.now() };
  return agendaData;
}
