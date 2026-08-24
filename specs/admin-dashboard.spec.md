# Spec: Administration & Housekeeping Dashboard (`/admin`)

> **Status**: Approved  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & User Story
- **As** Dad (Andrew),
- **I want** a dedicated single-column tabbed Administration dashboard with `General`, `Family Calendar`, and `School Lunch` tabs,
- **So that** I can focus on one widget at a time, immediately see actionable missing items in the next 30 days first, and review active rules without information overload.

---

## 2. Tabbed Architecture

```
+---------------------------------------------------------------------------------------+
| 🛠️ Scouty Planner • Admin & Housekeeping                [ 🏠 Back to Dashboard ]      |
+---------------------------------------------------------------------------------------+
|  [ 📊 General ]    |    [ 📅 Family Calendar (3 Alerts) ]    |    [ 🍴 School Lunch ] |
+---------------------------------------------------------------------------------------+

(When [ Family Calendar ] is active - Full width single column):
=========================================================================================
⚠️ ATTENTION NEEDED (NEXT 30 DAYS):
- 30-Day Missing Custom Icons Radar (Every uncustomized event in next 30 days)
- 30-Day Missing Details Radar (Games/practices missing field or address)
- Actionable To-Do Checklist

⚙️ ACTIVE RULES & CONFIGURATION:
- Active Categorization Rules (OSFC, Adams Rams, Holliston FH, Miller School)
- Connected Calendar Source Feeds
=========================================================================================

(When [ School Lunch ] is active - Full width single column):
=========================================================================================
⚠️ ATTENTION NEEDED (NEXT 30 DAYS):
- 30-Day Coverage Check: Alert if any school days in next 30 days lack loaded menus.

⚙️ LOADED SCHEDULES & INGESTION GUIDE:
- Current Schedule (June 2026, 20 Days, 100% Clean Strings)
- Ingestion Tool for upcoming monthly PDFs
=========================================================================================

(When [ General ] is active - Full width single column):
=========================================================================================
- System & Sync Health Summary
- Kiosk IP & LAN URL (192.168.86.236:3000)
- Calendar & Lunch quick diagnostic counters
=========================================================================================
```

---

## 3. Dynamic 30-Day Missing Icon Scanner
- Unlike hardcoded filter lists, the calendar housekeeping engine **dynamically inspects ALL calendar events occurring between `[today ... today + 30 days]`**.
- If an event does not match an explicit custom rule (`iconUrl` or custom badge), it is grouped by event type/summary and surfaced in the Missing Icons Radar with sample event dates and frequencies.
- If all events in the next 30 days have custom icons, the section displays: *"All upcoming events have custom icons assigned!"*

---

## 4. Acceptance Criteria Checklist
- [x] Top-level row of tabs: `General`, `Family Calendar`, `School Lunch`.
- [x] Each tab renders a clean, focused single-column layout.
- [x] "Attention Needed / Missing Items" section always appears first within each tab.
- [x] If no items need attention, explicitly display a success/all-clear card.
- [x] Calendar missing icon scanner evaluates all uncustomized events across the rolling 30-day window.
- [x] School lunch housekeeping verifies 30-day upcoming coverage.
