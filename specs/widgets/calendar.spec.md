# Spec: Google Calendar Live Agenda Widget

> **Status**: Approved / In Progress  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As a** parent or kid in the family,
- **I want to** see our family's schedule for the selected day in real-time,
- **So that** everyone knows what's happening without asking.

---

## 2. Visual & Display Design
- **Header**: Icon + Title **"Family Calendar"** ONLY (no subtitles, no view switcher buttons).
- **Content Area**:
  - Displays the timeline / agenda for the **Master Selected Date** from the top header.
  - Left colored border stripe matching each family member's calendar color.
  - Event time range chip with font-mono digital clock styling.
  - Location chip with map pin icon if an address/room is specified.
  - Live pulsing blue badge for events that are **"NOW"** (happening right now).
  - Countdown chip ("Starts in 15m") for events starting within the hour.
- **Empty State**: Cheerful empty state if no events are scheduled for that selected date.

---

## 3. Data Contract & Schema (`src/types/calendar.ts`)

```typescript
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
```

---

## 4. Acceptance Criteria Checklist
- [x] Header contains ONLY Icon + Title (zero internal date toggles or tabs).
- [x] Subscribes strictly to master date from `useDashboard()`.
- [x] SWR polls every 30 seconds for live updates.
- [x] Multi-calendar color badges and live "NOW" pulse badges render properly.
- [x] `npm test` passes with zero failures.
