# Timezone & School Calendar Intelligence Rules

## 1. Eastern Timezone (America/New_York) Rule
* All family events, school calendars, lunch menus, custody blocks, and UI views are anchored to **America/New_York (Eastern Time)**.
* Massachusetts is in EDT (UTC-4 in summer/fall) and EST (UTC-5 in winter).
* The server environment and client components must never assume local system time is equivalent to UTC.

## 2. All-Day Event & Majority-of-Day Boundary Intelligence
* **The "Fell Onto Both Days" Trap**:
  - Google Calendar and iCal feeds export date-only / all-day events at UTC midnight (`00:00:00Z`).
  - When converted to Eastern Time (UTC-4), an all-day event for Friday Sept 4 shifts back 4 hours to 8:00 PM Thursday Sept 3.
  - An all-day event intended for Friday must **never** pollute Thursday as an all-day holiday or school-off day.
* **Majority-of-Day Allocation**:
  - For all-day events (`allDay: true` or `dateOnly: true`), anchor directly to the intended calendar date (`YYYY-MM-DD`).
  - For multi-hour or giant events spanning across midnight, calculate active daytime / waking hours per day.
  - A late evening tail (starting $\ge$ 6:00 PM Eastern with $< 6$ hours before midnight) before an all-day span does NOT count the prior day as a holiday or "No School" day.
  - Similarly, an early morning tail ending before 6:00 AM does NOT count the next day as a holiday.

## 3. District & Child Scoping for School Status
* The family has children in two distinct school districts:
  - **Millis Public Schools (MPS)**:
    - Children: **Aria** (Millis Middle) & **Benjamin** (Clyde F. Brown Elementary).
    - Calendar source: `aria-ben` (`ariaandbenantonelli@gmail.com`).
    - Keywords: `millis`, `mps`, `cfb`, `aria`, `ben`.
  - **Holliston Public Schools (HPS)**:
    - Children: **Brighton** (Robert Adams Middle) & **Bennett** (Miller Elementary).
    - Calendar source: `brighton-bennett` (`0r9nd6ppr3qo1qjsqb5s3fefm8@group.calendar.google.com`).
    - Keywords: `holliston`, `hps`, `adams`, `miller`, `placentino`, `brighton`, `bennett`.
* **Scoping Logic**:
  - If a "No School" or "Early Release" event is on the `aria-ben` feed or explicitly mentions Millis/MPS/Aria/Ben, it must **only** annotate Aria and Benjamin. Brighton and Bennett must continue to show normal school.
  - If an event is on the `brighton-bennett` feed or explicitly mentions Holliston/HPS/Adams/Miller, it must **only** annotate Brighton and Bennett. Aria and Benjamin must continue to show normal school.
  - Only broad, district-independent holidays (e.g. `Labor Day`, `Thanksgiving`, `Memorial Day`) apply to all four children.
