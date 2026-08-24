export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  icsUrl?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  sourceId: string;
  sourceName: string;
  color: string;
  isHappeningNow?: boolean;
  minutesUntilStart?: number;
}

export interface CalendarAgenda {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  upcoming: {
    date: string;
    dateFormatted: string;
    events: CalendarEvent[];
  }[];
  lastUpdated: string;
}

