export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  icsUrl?: string;
}

export interface EventEnrichment {
  child?: {
    id: string;
    name: string;
    color?: string;
  };
  category?: string;
  badgeText?: string;
  iconUrl?: string;     // Custom image URL (e.g. /icons/teams/osfc.png)
  iconName?: string;    // Lucide icon name (e.g. Trophy, Stethoscope, School)
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
  enrichment?: EventEnrichment;
}

export interface CalendarAgenda {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  upcoming: {
    date: string;
    dateFormatted: string;
    events: CalendarEvent[];
  }[];
  byDate: Record<string, CalendarEvent[]>;
  lastUpdated: string;
}
