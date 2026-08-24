# Antigravity Rules: Swentonelli Family Dashboard Development

## Spec-Driven Development Workflow

For all widget creation, iterations, and data ingestion in this repository, follow this structured process:

```
[User Request / Feedback] ➔ [Update Spec in specs/widgets/*.spec.md] ➔ [Review] ➔ [Implementation] ➔ [npm test Verification]
```

---

## Strict Rule: Master Single-Point Date Architecture

1. **Zero Date Display / Zero Date Navigation Inside Widgets**:
   - Date-driven widgets (Family Calendar, School Lunch, Chores, etc.) are **pure presentation components**.
   - Individual widgets **MUST NOT** display the current/selected date (e.g. "Sunday, August 24, 2026") inside their card or header.
   - Individual widgets **MUST NOT** contain their own date steppers, date pickers, or local date navigation state.
   - Individual widget headers must contain **ONLY** their icon and title (e.g. `[📅] Family Calendar`, `[🍴] School Lunch`) plus any widget-specific view toggle (e.g. 4-column kids view vs aggregate view).
   - **Automated Verification**: Test suites MUST inspect rendered widget output to ensure no redundant date header strings are rendered inside widgets.

2. **Master Header Controls All Date Context**:
   - All active dates, day steppers, and date picker selections originate exclusively from `DashboardContext` and are controlled by the **Master Header**.
   - The master header provides both next/previous day navigation and an interactive date picker popover to jump to any date.
   - When the master date changes at the top, all widgets update in unison.

---

## Strict Rule: Family Calendar Dual Views (4-Column Kids View + Aggregate List View)

1. **Default View: 4-Column Child Timeline ("All Kids View")**:
   - Displays 4 distinct columns from left to right: **Aria** (Blue), **Brighton** (Orange), **Benjamin** (Purple), **Bennett** (Amber).
   - Events flow vertically (chronological downward).
   - **Time-Proportional Staggering / Alignment**: Events are rendered with relative vertical positioning or time-grid offsets so that concurrent and staggered event times (e.g. Aria at 11:00 AM vs Benjamin at 11:45 AM) are visually aligned to their relative timing.
2. **Secondary View: Aggregate List View**:
   - Shows a chronological stream of all events across all kids, with custom team/school badges and icons.
3. **Leading Icon Uniformity**:
   - All event cards have a uniform 48px leading avatar container.
   - Events without explicit custom rules in `config/event_rules.json` use the generic `Calendar` icon.

---

## Strict Rule: Administration Tabbed Architecture & 30-Day Rolling Diagnostics

1. **Tabbed Single-Column Structure on `/admin`**:
   - The `/admin` subpage uses a clean row of top-level tabs to prevent information overload:
     - **`[ 📊 General ]`**: System status, calendar feed sync health, kiosk URL/IP, and diagnostic overview.
     - **`[ 📅 Family Calendar ]`**: Single-column calendar administration.
     - **`[ 🍴 School Lunch ]`**: Single-column school lunch administration.
2. **Prioritization of Attention Items ("Missing First")**:
   - Every widget admin tab displays **Open Action Items / Attention Needed FIRST**:
     - Missing custom icons on upcoming events.
     - Missing locations on matches/games.
     - Missing lunch PDF schedules in the next 30 days.
   - When nothing requires attention, the section MUST explicitly state: *"All clear — no actions needed"*.
   - Active rules, configured feeds, and configuration guides appear below the attention items.
3. **Rolling 30-Day Diagnostic Evaluation Window**:
   - Both **Calendar** and **School Lunch** diagnostics strictly scan the **rolling 30-day window**: `[Today ... Today + 30 Days]`.
   - Dynamic scanning: The calendar admin dynamically flags **EVERY SINGLE recurring or uncustomized event** occurring in the next 30 days that lacks a custom icon.

---

## Automated Verification & Test Requirement
- After every modification, you MUST run `npm test` (running `scripts/smoke-test.ts`).
- `npm test` automatically verifies:
  1. Full TypeScript & JSX syntax validation (`tsc --noEmit`).
  2. Data file integrity and clean strings (no `(V)` substrings).
  3. No widget contains internal date strings.
  4. All API routes (`/api/lunch`, `/api/calendar`, `/api/admin`) respond with HTTP 200.
  5. The homepage `/` and `/admin` render HTTP 200 with zero Next.js errors.
  6. All static script and CSS assets load with HTTP 200.
