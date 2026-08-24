# Spec: Administration & Housekeeping Dashboard (`/admin`)

> **Status**: Approved / In Progress  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As** Dad (Andrew),
- **I want** a dedicated Administration & Housekeeping subpage accessible from the bottom of the Scouty Planner header,
- **So that** I can easily discover missing icons, check active business rules, see upcoming months missing lunch PDFs, and tighten up the entire family dashboard.

---

## 2. Layout & Architecture (Mirroring Main Widgets)

The `/admin` subpage uses the exact same 2-column dashboard layout as the main screen:

```
+---------------------------------------------------------------------------------------+
| 🛠️ Scouty Planner • Admin & Housekeeping               [ 🏠 Back to Dashboard ]       |
+---------------------------------------------------------------------------------------+
|  LEFT (7 Cols): Family Calendar Housekeeping | RIGHT (5 Cols): School Lunch Housekeep |
|  - Active Categorization Rules               | - Monthly Menu Coverage Status         |
|    • Aria OSFC Rule with OSFC Crest          |   • June 2026: Loaded (20 days)        |
|  - Missing Custom Icons Radar                |   • Sept/Oct 2026: Missing PDF Alert   |
|    • Placentino Elementary School (Son)      | - Parser Diagnostics & Alerts          |
|    • Adams Middle School (Daughter)          | - Ingestion Guide for Dad              |
|    • Brighton Field Hockey Crest             |                                        |
|  - Housekeeping Action Checklist for Dad     |                                        |
+---------------------------------------------------------------------------------------+
```

---

## 3. Family Calendar Housekeeping Specifications
1. **Active Rules Section**:
   - Displays all rules currently active in `config/event_rules.json` (e.g. Aria OSFC Soccer with image preview, pattern triggers, and badge text).
2. **Missing Icons & Housekeeping Radar**:
   - Analyzes all parsed calendar events across all feeds.
   - Highlights events that currently fall back to the generic calendar icon and need custom icons:
     - **Placentino Elementary School** (Holliston) for son (e.g. Meet and Greet, School events).
     - **Adams Middle School** (Holliston) for daughter.
     - **Brighton Field Hockey** (Patoma / Millis).
     - **Medical & Pediatric Well Visits**.
3. **Actionable Checklist**:
   - Clear instructions on what image assets or rules Dad can provide to complete icon coverage.

---

## 4. School Lunch Housekeeping Specifications
1. **Menu Coverage**:
   - Shows active schedule month (e.g. June 2026) and total days.
   - Flags missing upcoming months (e.g. September 2026 / October 2026) where school resumes.
2. **Parser Diagnostics**:
   - Displays count of parsed days, verifies clean items (no `(V)` substrings), and flags any unparsed lines.
3. **Ingestion Helper**:
   - Step-by-step instructions for uploading upcoming monthly PDFs to `data/`.

---

## 5. Main Page Calendar Icon Fallback Rule
- On the main kiosk page, calendar events **MUST** display the generic calendar icon (`Calendar`) by default when no explicit custom rule icon is defined.
- No arbitrary icons are invented on the fly.

---

## 6. Acceptance Criteria Checklist
- [x] Link to `/admin` placed on the bottom of the Scouty Planner header.
- [x] `/admin` renders 2-column layout mirroring main widgets (Calendar Housekeeping left, Lunch Housekeeping right).
- [x] Calendar housekeeping shows active rules (Aria OSFC), missing icon alerts (Placentino, Adams, Field Hockey), and Dad's checklist.
- [x] Lunch housekeeping shows coverage status, missing upcoming month alerts, and parsing diagnostics.
- [x] Main dashboard events use generic calendar icon unless an explicit custom icon rule is matched.
- [x] `npm test` passes with zero failures.

