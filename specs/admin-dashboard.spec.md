# Spec: Administration & Housekeeping Dashboard (`/admin`)

> **Status**: Approved / In Progress  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As** Dad (Andrew),
- **I want** a dedicated Administration & Housekeeping subpage accessible from the bottom of the Scouty Planner header,
- **So that** I can easily discover missing icons, missing event details, check active business rules, see upcoming months missing lunch PDFs, and tighten up the entire family dashboard.

---

## 2. Rolling 30-Day Evaluation Window Rule
- **Strict Scope**: All calendar housekeeping evaluations, warnings, missing icon detections, and missing location warnings **MUST strictly evaluate events in the rolling 30-day window**:
  👉 **`[Today ... Today + 30 Days]`**
- Events in the past (< today) or far in the future (> 30 days away) do not trigger warnings, keeping Dad's attention focused on immediate upcoming items.

---

## 3. Layout & Architecture (Mirroring Main Widgets)

The `/admin` subpage uses the exact same 2-column dashboard layout as the main screen:

```
+---------------------------------------------------------------------------------------+
| 🛠️ Scouty Planner • Admin & Housekeeping (Next 30 Days)  [ 🏠 Back to Dashboard ]     |
+---------------------------------------------------------------------------------------+
|  LEFT (7 Cols): Family Calendar Housekeeping | RIGHT (5 Cols): School Lunch Housekeep |
|  - Active Categorization Rules               | - Monthly Menu Coverage Status         |
|    • Aria OSFC Soccer Crest                  |   • June 2026: Loaded (20 days)        |
|    • Adams Middle School Rams Crest          |   • Sept/Oct 2026: Missing PDF Alert   |
|  - Missing Icons & Details Radar (Next 30d)  | - Parser Diagnostics & Alerts          |
|    • Placentino Elementary School (Son)      | - Ingestion Guide for Dad              |
|    • Brighton Field Hockey Crest             |                                        |
|    • Events with Missing Locations           |                                        |
|  - Housekeeping Action Checklist for Dad     |                                        |
+---------------------------------------------------------------------------------------+
```

---

## 4. Family Calendar Housekeeping Specifications
1. **Active Rules Section**:
   - Displays all rules currently active in `config/event_rules.json` (e.g. Aria OSFC, Adams Middle School Rams).
2. **Missing Icons & Housekeeping Radar (Next 30 Days Only)**:
   - Scans events between `[today ... today + 30 days]`.
   - Flags recurring entities that fall back to the generic calendar icon:
     - **Placentino Elementary School** (Holliston) for son (e.g. Meet and Greet, School events in next 30 days).
     - **Brighton Field Hockey** (Patoma / Millis games in next 30 days).
     - **Medical & Pediatric Well Visits** in next 30 days.
   - Flags events missing locations (e.g. away games or off-site appointments without address).
3. **Dad's Action Checklist**:
   - Clear status indicators for configured items (`done`) vs actionable pending tasks (`pending`).

---

## 5. School Lunch Housekeeping Specifications
1. **Menu Coverage**:
   - Shows active schedule month and total days.
   - Flags missing upcoming months (e.g. September 2026 / October 2026).
2. **Parser Diagnostics & Ingestion Guide**:
   - Step-by-step instructions for uploading upcoming monthly PDFs to `data/`.

---

## 6. Acceptance Criteria Checklist
- [x] All calendar warnings and missing icon scans evaluate strictly within `[today ... today + 30 days]`.
- [x] Link to `/admin` placed on the bottom of the Scouty Planner header.
- [x] `/admin` renders 2-column layout mirroring main widgets.
- [x] Calendar housekeeping shows active rules, 30-day missing icon radar, and Dad's checklist.
- [x] Lunch housekeeping shows coverage status and missing upcoming month alerts.
- [x] Main dashboard events use generic calendar icon unless an explicit custom icon rule is matched.
- [x] `npm test` passes with zero failures.
