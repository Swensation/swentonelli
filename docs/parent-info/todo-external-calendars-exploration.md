# TODO: Multi-Source External Calendar Aggregation & Ingestion Strategy

> **Status**: Open / Architectural Spike  
> **Topic**: Ingesting Fragmented External Calendars (Therapy, Sports, School, Medical) per Child  
> **Created**: September 2026  

---

## 1. Context & Problem Statement

Historically, family scheduling was organized around shared Google Calendars between households (e.g., a singular *"Brighton and Bennett"* calendar and *"Aria and Ben"* calendar shared between Andrew, Callie, Chris, and Liz).

As the children grow older and participate in more specialized activities, a singular shared calendar per pair of kids is no longer feasible or scalable:
* **Fragmented External Systems**: Providers now publish their own direct `.ics` calendar feeds (e.g., counseling/therapy clinics via JaneApp, sports teams via TeamSnap/LeagueApps, school district event feeds).
* **Concrete Example**:
  * **Provider**: Coastal Counseling Associates (JaneApp)
  * **Feed URL**: `https://coastalcounselingassoc.janeapp.com/ical/os8kYdRB5aLISvkmFVDo/appointments.ics`
  * **Status**: *Verified reachable (HTTP 200, valid `VCALENDAR` payload with individual therapy sessions)*.
* **Multi-Household Complexity**: Different parents and co-parents receive different subscription links from separate provider portals. Manually re-entering these appointments into a shared Google Calendar is prone to sync delays, human error, and missing updates when providers reschedule sessions.

---

## 2. Key Architecture Challenges

1. **Feed Attribution & Child Mapping**:
   * Some external feeds are specific to a single child (e.g., Brighton's therapy sessions or Aria's soccer team).
   * Other feeds might include appointments for multiple siblings under one family portal account.
   * Feeds need deterministic mapping to child columns (`aria`, `brighton`, `benjamin`, `bennett`).

2. **Privacy & Display Controls**:
   * Sensitive appointments (e.g., therapy, counseling, medical appointments) should display cleanly on the kitchen dashboard without exposing unnecessary clinical metadata or private notes.

3. **Feed Health & Resiliency**:
   * External feeds may rotate tokens, expire, or return transient 500/404 errors.
   * Feeds must adhere to the **External Resource Validation Invariant** (probed for HTTP 200 reachability and payload integrity).

4. **Bi-Directional vs. Aggregation-Only**:
   * **Inbound (Dashboard Aggregation)**: Pulling all feeds into the Swentonelli kitchen dashboard.
   * **Outbound (Consolidated Subscriptions)**: Generating a unified subscription feed so parents can subscribe to their child's combined schedule directly on their iPhones or Google Calendars.

---

## 3. Options to Explore

```
               ┌────────────────────────────────────────────────────────┐
               │              External Calendar Feeds                   │
               │                                                        │
               │  [JaneApp Therapy]   [TeamSnap OSFC]   [School (.ics)] │
               └───────────┬───────────────────┬───────────────┬────────┘
                           │                   │               │
                           ▼                   ▼               ▼
               ┌────────────────────────────────────────────────────────┐
               │           Swentonelli Ingestion Engine                 │
               │        (Server-side fetch + node-ical + rrule)         │
               └───────────────────────────┬────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌─────────────────────────┐                   ┌─────────────────────────┐
       │     Kitchen Dashboard   │                   │ Consolidated Parent     │
       │    (4-Column Timeline)  │                   │    Subscribable Feed    │
       └─────────────────────────┘                   └─────────────────────────┘
```

### Option A: Federated Feed Registry in `config/calendars.json`
* **Mechanism**: Allow `config/calendars.json` to define child-bound feeds with metadata:
  ```json
  {
    "id": "brighton-therapy-coastal",
    "name": "Brighton Therapy (Coastal)",
    "color": "#f9a8d4",
    "childId": "brighton",
    "category": "Therapy",
    "icsUrl": "https://coastalcounselingassoc.janeapp.com/ical/os8kYdRB5aLISvkmFVDo/appointments.ics"
  }
  ```
* **Pros**: Version-controlled, zero database overhead, fast server-side aggregation.
* **Cons**: Requires code commit/PR to add new feeds.

### Option B: Dynamic Feed Manager in Admin UI (`/admin`)
* **Mechanism**: Build an interactive feed management tab in the Admin page backed by Firestore or a local JSON store.
* **Features**:
  * Add/Edit/Delete external iCal URLs.
  * Live URL reachability validator with 1-click test button.
  * Assign feed to specific children or family members.
* **Pros**: Non-technical parents can paste a new sports or therapy link right from their phones.
* **Cons**: Requires persistent writable storage layer (e.g. Firestore / App Hosting backend).

### Option C: Smart Keyword Rules & Entity Extraction
* **Mechanism**: Continue ingesting combined feeds, but leverage `eventRules.ts` and `children_registry.json` match keywords (e.g. `"Beth Calabrese for Brighton Swenson"` automatically extracts `child: brighton`, `category: Therapy`, `icon: /icons/general/therapy.png`).
* **Pros**: Works seamlessly with existing infrastructure without modifying feed schemas.
* **Cons**: Needs ongoing rule maintenance if event title formats change.

### Option D: Outbound Consolidated ICS Endpoint
* **Mechanism**: Provide endpoints like `/api/calendar/export?child=brighton` or `/api/calendar/export?family=all`.
* **Pros**: Solves the mobile sync problem for co-parents who want a single consolidated calendar feed on their personal devices.
* **Cons**: Requires building an RFC 5545 iCal generator route.

---

## 4. Next Steps & Implementation Plan

- [ ] **Spike 1**: Test adding child-bound feeds directly into `config/calendars.json` and verify parsing in `src/lib/calendar.ts`.
- [ ] **Spike 2**: Evaluate event title parsing for JaneApp format (`"Individual Therapy Session (In-person) with Beth Calabrese for Brighton Swenson"`).
- [ ] **Spike 3**: Design Admin UI mockups for self-service feed entry and health probing.
- [ ] **Spike 4**: Investigate generating a unified outbound `.ics` feed for iOS/Google Calendar subscriptions.

