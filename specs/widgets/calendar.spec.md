# Spec: Family Calendar Widget

> **Status**: Approved  
> **Author**: Andrew (Dad)  
> **Last Updated**: 2026-08-24  

---

## 1. Dual View Specifications

### View 1: 4-Column "All Kids" Timeline (Default View)
- **Columns (Left to Right)**:
  1. **Aria** (Theme: Blue `#3b82f6`)
  2. **Brighton** (Theme: Orange `#f97316`)
  3. **Benjamin** (Theme: Purple `#8b5cf6`)
  4. **Bennett** (Theme: Amber `#f59e0b`)
- **Chronological Vertical Layout**:
  - Events flow from top to bottom based on start time.
- **Relative Time Staggering / Vertical Alignment**:
  - Event cards are positioned relative to a vertical time-scale / grid so that concurrent and staggered event times (e.g., Aria at 11:00 AM vs. Benjamin at 11:45 AM) visually reflect their chronological offset and relative timing throughout the day.
- **Cards**:
  - Compact cards with 36px-48px icon container, time pill, title, and location pill.

### View 2: Aggregate List View
- Single stream of all events sorted chronologically.
- Full 48px fixed icon avatars with child badge, category badge, and location.

---

## 2. Zero-Date Header Rule
- The Calendar Widget **MUST NOT** render any internal date subtitle (e.g. "Sunday, August 24").
- The widget header contains ONLY:
  - `[📅] Family Calendar` title
  - View switcher buttons: `[ 👥 Kids Columns | 📋 List View ]`

---

## 3. Leading Icon Uniformity
- Every event has a uniform icon container.
- If no custom rule matches in `config/event_rules.json`, it renders the generic `Calendar` icon.

---

## 4. Acceptance Criteria Checklist
- [x] Default view displays 4 columns: Aria, Brighton, Benjamin, Bennett.
- [x] Events in columns reflect relative chronological timing / vertical alignment.
- [x] Toggle allows switching between 4-column and aggregate list view.
- [x] No date string rendered inside the widget.
- [x] 100% automated test coverage in `scripts/smoke-test.ts`.
