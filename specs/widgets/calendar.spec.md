# Spec: Google Calendar Live Agenda Widget

> **Status**: Approved / Active  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As a** parent or kid in the family,
- **I want to** see our family's schedule for any selected day (past, present, or future) in real-time,
- **So that** we can look up what happened earlier in the week/month or see what is coming up.

---

## 2. Visual & Display Design
- **Header**: Icon + Title **"Family Calendar"** ONLY.
- **Content Area**:
  - Displays the timeline / agenda for the **Master Selected Date** from the top header (`selectedDate`).
  - Supports historical browsing (past days) as well as future days (+/- 60 day range).
  - **Uniform Icon Container**: Every event card features a leading fixed-size (`48px / w-12 h-12`) rounded container:
    - Custom team/activity logo (e.g. OSFC soccer crest) if available.
    - Category vector icon (Trophy, Stethoscope, GraduationCap, Palmtree, Users, etc.) as default.
  - Left colored border stripe matching each family member's calendar color.
  - Event time range chip with font-mono digital clock styling.
  - Location chip with map pin icon if an address/room is specified.
  - Live pulsing blue badge for events that are **"NOW"** (happening right now).
- **Empty State**: Cheerful empty state if no events are scheduled for that selected date.

---

## 3. Data Contract & Schema (`src/types/calendar.ts`)

```typescript
export interface EventEnrichment {
  child?: {
    id: string;
    name: string;
    color?: string;
  };
  category?: string;
  badgeText?: string;
  iconUrl?: string;     // Custom image URL (e.g. /icons/teams/osfc.png)
  iconName?: string;    // Lucide icon name
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
  byDate: Record<string, CalendarEvent[]>; // YYYY-MM-DD -> events (supports past & future)
  lastUpdated: string;
}
```

---

## 4. Acceptance Criteria Checklist
- [x] Every event has a uniform-sized (48px / `w-12 h-12`) leading icon container.
- [x] Custom team crests render at full resolution inside the container.
- [x] Supports past date navigation (displays historical events when stepping backward in time).
- [x] Header contains ONLY Icon + Title (zero internal date toggles or tabs).
- [x] Subscribes strictly to master date from `useDashboard()`.
- [x] SWR polls every 30 seconds for live updates.
- [x] `npm test` passes with zero failures.
