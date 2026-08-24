# Antigravity Rules: Swentonelli Family Dashboard Development

## Spec-Driven Development Workflow

For all widget creation, iterations, and data ingestion in this repository, follow this structured process:

```
[User Request / Feedback] ➔ [Update Spec in specs/widgets/*.spec.md] ➔ [Review] ➔ [Implementation] ➔ [npm test Verification]
```

---

## Strict Rule: Master Single-Point Date Architecture

1. **Zero Date Navigation Inside Widgets**:
   - Date-driven widgets (Family Calendar, School Lunch, Chores, etc.) are **pure presentation components**.
   - Individual widgets **MUST NOT** contain their own date steppers, date pickers, day/week/month view switchers, or local date navigation state.
   - Individual widget headers must contain **ONLY** their icon and title (e.g. `[📅] Family Calendar`, `[🍴] School Lunch`).
2. **Master Header Controls All Date Context**:
   - All active dates, day steppers, and view states originate exclusively from `DashboardContext` and are controlled by the **Master Header**.
   - When the master date changes at the top, all widgets update in unison.

---

## Strict Rule: Dual-View Architecture & 30-Day Admin Housekeeping Window

1. **Every Widget Defines Two Views**:
   - **Kiosk Presentation View**: The clean, kid-friendly main dashboard UI.
   - **Admin Housekeeping View**: The diagnostic dashboard on `/admin` for Dad to identify missing assets, missing icons, unparsed menus, and maintenance tasks.
2. **Admin Layout Mirrors Main Widgets**:
   - The `/admin` page mirrors the 2-column layout of the main dashboard:
     - **Left Column**: Family Calendar Housekeeping (active rules, missing team/school icons, unclassified events).
     - **Right Column**: School Lunch Housekeeping (upcoming months missing PDF schedules, parsing warnings, coverage status).
3. **Rolling 30-Day Evaluation Window for Calendar Warnings**:
   - All calendar housekeeping warnings (missing icons, missing locations, uncategorized events, unassigned children) **MUST strictly evaluate events occurring in the rolling 30-day window**: `[Today ... Today + 30 Days]`.
   - Historical events (< Today) and distant future events (> 30 days away) MUST NOT trigger housekeeping warnings, keeping Dad's task list focused on actionable, upcoming items.
4. **Calendar Icon Fallback Rule**:
   - On the main dashboard, calendar events **MUST** use the standard generic calendar icon by default.
   - **Do NOT invent arbitrary icons**. Custom icons are only displayed if an explicit rule is configured in `config/event_rules.json` (such as Aria's OSFC team crest or Adams Rams crest).

---

## School Lunch Multiple Feeds & Monthly Ingestion Workflow

1. **Support for Multiple School Lunch Feeds**:
   - The family has children across different schools/grades (e.g., Placentino Elementary, Adams Middle School, High School).
   - The school lunch system **MUST** support multiple school lunch feeds simultaneously.
   - Each feed is identified by a school ID/name and stores its own monthly schedule.
   - The UI presents the lunch menu for each configured school feed corresponding to the **Master Selected Date**.

2. **Monthly Ingestion Process**:
   - When Dad (Andrew) provides a Google Drive link or PDF for a given school/month:
     1. Download to `data/<school_id>_<month_year>.pdf`.
     2. Parse grid into clean `items: string[]` (each meal item on its own line).
     3. **Clean String Rule**: Strip any `(V)` or `(V) ` vegetarian tags. Do not create vegetarian badges.
     4. Store in `data/lunch_schedule.json` (or multi-feed data store).
     5. Surface parsing status and upcoming coverage in the Admin Housekeeping panel.

---

## Automated Verification & Test Requirement
- After every modification or ingestion, you MUST run `npm test` (running `scripts/smoke-test.ts`).
- `npm test` automatically verifies:
  1. Full TypeScript & JSX syntax validation (`tsc --noEmit`) across the entire codebase.
  2. Data file integrity and clean strings (no `(V)` substrings, array of items).
  3. All API routes (`/api/lunch`, `/api/calendar`, `/api/admin`) respond with HTTP 200.
  4. The homepage `/` and `/admin` render HTTP 200 with zero Next.js compile/syntax error overlays.
  5. Every single script and stylesheet asset linked in the HTML resolves with HTTP 200 (ensuring 0 broken 404 chunks).
