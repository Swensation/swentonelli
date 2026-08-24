# Swentonelli Family Dashboard - Technical Architecture

## 1. Overview
The Swentonelli Family Dashboard is a modern fullstack Next.js web application designed to run 24/7 on a kitchen computer monitor (via Google Chrome in kiosk mode) and on family mobile devices / tablets (Safari on iOS / iPadOS).

## 2. Core Subsystems

### A. Live Google Calendar Synchronization
- **Transport**: Private iCal feed URLs (`.ics`) exported from Google Calendar settings.
- **Why iCal over OAuth2 tokens**: Read-only, zero token expiration/refresh dance, zero GCP console setup needed, safe for kids to work with.
- **Polling & Caching Strategy**:
  - Server-side route `/api/calendar` parses the feed with `node-ical` and caches responses for 30s (`stale-while-revalidate`).
  - Client-side SWR polls every 30 seconds (`refreshInterval: 30000`).
  - Auto-revalidates instantly when the kitchen screen wakes or tab gains focus (`revalidateOnFocus: true`).
- **Recurring Events**: Expanded across a rolling 14-day window using the RRULE engine.
- **Multiple Calendars**: Supports multiple family members (e.g. Dad, Mom, Kids, School, Sports) via `GOOGLE_CALENDAR_SOURCES` in `.env.local`.

### B. School Lunch Pipeline
- **Storage**: `data/lunch_schedule.json`.
- **Parsing**: `scripts/parse-lunch-pdf.ts` handles ingestion of monthly PDF menus posted to Google Drive or local files.
- **Display Priority**: Focuses on **"Tomorrow's Lunch"** (and provides toggles for "Today" and "This Week").
- **Special States**: Auto-flags "No School", "Early Release", "Field Trips", "Exam Days", and "Vegetarian (V)".
- **School Feed Inquiry Guide**:
  - When talking to the school/district food service director, the ideal formats to ask for are:
    1. **Direct iCal Feed (`.ics`)**: Cafeteria calendar feed.
    2. **District Platform API**: Vendors like Nutrislice, MySchoolMenus (Health-e Pro), or Linq Connect (Titan) often have public JSON endpoints.
    3. **Published Google Sheet**: Simplest automated table.

### C. Kitchen Kiosk Mode & Mobile Setup
- **Chrome Fullscreen on Kitchen PC**:
  - Launch Chrome in kiosk mode: `chrome.exe --kiosk http://localhost:3000` or press the Fullscreen icon / `F11`.
  - Built-in live clock with blinking colons, seconds, and date header for readability across the room.
- **iPad / iPhone Safari**:
  - Fully responsive CSS grid.
  - PWA configured: Tap **Share -> Add to Home Screen** on iOS to run full-screen as a native app.

## 3. Kid Extensibility System
- **Widget Pattern**: All widgets reside in `src/components/widgets/`.
- **Boilerplate**: `src/components/widgets/TemplateWidget/TemplateWidget.tsx`.
- **Mock Mode**: `src/lib/mockData.ts` allows building and testing widgets offline without API keys.
- **Antigravity Rulebook**: `.agent/rules/widget-creation.md` guides AI pair programming for the kids.

