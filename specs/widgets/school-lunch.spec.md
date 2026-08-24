# Spec: School Lunch Widget (Multi-School Feeds)

> **Status**: Approved / Active  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As a** parent with children across different schools (Elementary, Middle, High School),
- **I want to** see the cafeteria lunch menus for all of our kids' schools for the selected day,
- **So that** we know what each child is having for lunch from a single glance.

---

## 2. Multi-School Feed Architecture

### Supported School Feeds
1. **Elementary Schools** (e.g. Aria, Brighton, Benjamin, Bennett depending on grade)
2. **Middle Schools**
3. **High Schools**

### Ingestion Rule
- Each school's monthly PDF is ingested and stored with clean `items: string[]` (each item on its own line).
- All `(V)` vegetarian tags are stripped.

---

## 3. Data Schema (`src/types/lunch.ts`)

```typescript
export interface DailyLunchMenu {
  date: string; // YYYY-MM-DD
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  items: string[];
  isNoSchool: boolean;
  isEarlyRelease?: boolean;
  isLastDay?: boolean;
  specialNote?: string;
}

export interface SchoolLunchFeed {
  schoolId: string;       // e.g. "elementary", "middle", "high"
  schoolName: string;     // e.g. "Elementary Schools", "Middle School"
  month: string;
  year: number;
  days: Record<string, DailyLunchMenu>;
}

export interface MultiSchoolLunchSchedule {
  schools: Record<string, SchoolLunchFeed>;
}

export interface MultiSchoolDayResponse {
  selectedDate: string;
  feeds: Array<{
    schoolId: string;
    schoolName: string;
    menu: DailyLunchMenu | null;
  }>;
  allDays: DailyLunchMenu[];
  lastUpdated: string;
}
```

---

## 4. Visual & Presentation Design
- **Header**: Icon + Title **"School Lunch"** ONLY (no subtitles, no local date buttons).
- **Content Area**:
  - Displays a card for each active school feed for the **Master Selected Date**.
  - If multiple schools are configured, renders each school's daily meal stacked or tabbed cleanly.
  - Line-by-line items (1st item bold, subsequent items indented with a subtle bullet).
  - Badges for `No School`, `Early Release`, `Last Day`.

---

## 5. Acceptance Criteria Checklist
- [x] Supports multiple school lunch feeds simultaneously (e.g. Elementary, Middle, High).
- [x] Header contains ONLY Icon + Title.
- [x] Pure presentation component synchronized to `DashboardContext.selectedDate`.
- [x] All items render line-by-line without comma lists.
- [x] `npm test` passes with zero failures.
