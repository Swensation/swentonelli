# Custody Calculation Audit: Ben & Aria (Aug 27 – Aug 31, 2026)

This document provides a day-by-day audit explaining exactly how the custody badges were calculated for **Benjamin** and **Aria** for this week, from today (**Thursday, August 27**) through **Monday, August 31, 2026**.

---

## 1. The Active Rule for Benjamin & Aria

Under the simplified custody rules engine in `data/custody_rules` and `specs/annotations-and-badges.spec.md`:

1. **Exact Match `Callie kids``:
   - If an event title on that date is exactly `Callie kids` (case-insensitive, trimmed):
   - **Determined**: **Mom's (Callie in Millis, MA — Maroon `800020`)**.
2. **Exact Match `Chris kids``:
   - If an event title on that date is exactly `Chris kids` (case-insensitive, trimmed):
   - **Determined**: **Dad's (Chris in Franklin, MA — Blue `2563eb`)**.
3. **Conflict / Error Fallback**:
   - If both `Callie kids` and `Chris kids` appear on the same date:
   - **Determined**: **`[ ⚠ ! ]` (Conflicted Schedule — Amber `b45309`)**.
4. **Otherwise (No Matching Custody Event)**:
   - If no custody indicator is present on that date:
   - **Determined**: **Dat's (Chris in Franklin, MA — Blue `2563eb`)**.

---

## 2. Day-by-Day Audit & Match Determinations

### Day 1: Thursday, August 27, 2026 (Today)

- **Calendar Events Ingested for Today**:
  - `[Aria and Ben]`: `Juliana�s bday Level99 in Natick (For Aria)`
  - `[Brighton and Bennett]`: `Liz kids`
- **Rule Matching Evaluation**:
  - Event title `Juliana’s bday Level99 in Natick (For Aria)` does **NOT** equal `callie kids`.
  - Event title `Juliana’s bday Level99 in Natick (For Aria)` does **NOT�* equal `chris kids`.
  - No other custody event exists on the `Aria and Ben` feed for this date.
- **Explicit Determination**:
  > **Because of no `Callie kids` match** on the calendar for this date, the cOtherwise` rule was triggered. **This was determined to be Dad's (Chris in Franklin)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏠 Dad's ]`
  - **Parent**: Chris
  - **Town**: Franklin, MA
  - **Color**: Blue (`#2563eb`)

---

### Day 2: Friday, August 28, 2026

- **Calendar Events Ingested for This Date**:
  - `[Aria and Ben]`: `Callie Kids`
  - `[Aria and Ben]`: `OSFC Girls U13 NEFC Tournament Pre-Fall`
  - `[Brighton and Bennett]`: `Andrew Kids`
- **Rule Matching Evaluation**:
  - Event title `Callie Kids` (normalized to `callie kids`) is an **EXACT MATCH** for `callie kids`.
  - No conflicting `Chris kids` event exists on this date.
- **Explicit Determination**:
  > **Because of this exact match on `Callie Kids`**, **this was determined to be Mom's (Callie in Millis)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🎚肶� Mom's ]`
  - **Parent**: Callie
  - **Town**: Millis, MA
  - **Color**: Maroon (`#800020`)

---

### Day 3: Saturday, August 29, 2026

- **Calendar Events Ingested for This Date**:
  - `[Aria and Ben]`: `OSFC Girls U13 NEFC Tournament Pre-Fall`
  - `[Brighton and Bennett]`: `Andrew Kids`
  - `[Brighton and Bennett]`: `Brighton Field Hockey Game 🏷`
- **Rule Matching Evaluation**:
  - Event title `OSFC Girls U13 NEFC Tournament Pre-Fall` does **NOT�* equal `callie kids`.
  - Event title `OSFC Girls U13 NEFC Tournament Pre-Fall` does **NOT** equal `chris kids`.
  - No custody event was entered on the `Aria and Benk feed for this date.
- **Explicit Determination**:
  > **Because of no `Callie kids` match** on the calendar for this date, the `Otherwise` rule was triggered. **This was determined to be Dad's (Chris in Franklin)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏠 Dad's ]`
  - **Parent**: Chris
  - **Town**: Franklin, MA
  - **Color**: Blue (`#2563eb`)

---

### Day 4: Sunday, August 30, 2026

- **Calendar Events Ingested for This Date**:
  - `[Aria and Ben]`: *(No events scheduled on this feed)*
  - `[Brighton and Bennett]`: `Andrew Kids`
  - `[Brighton and Bennett]`: `Brighton Field Hockey Practice 🏷`
- **Rule Matching Evaluation**:
  - Zero events exist on the `Aria and Ben` calendar feed for this date.
  - No `Callie kids` event found.
- **Explicit Determination**:
  > **Because of no `Callie kids` match** (empty calendar feed for this date), the cOtherwise` rule was triggered. **This was determined to be Dad's (Chris in Franklin)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏠 Dad's ]`
  - **Parent**: Chris
  - **Town**: Franklin, MA
  - **Color**: Blue (`#2563eb`)

---

### Day 5: Monday, August 31, 2026

- **Calendar Events Ingested for This Date**:
  - `[Aria and Ben]`: *(No events scheduled on this feed)*
  - `[Brighton and Bennett]`: `Liz kids`
- **Rule Matching Evaluation**:
  - Zero events exist on the `Aria and Ben` calendar feed for this date.
  - No `Callie kids` event found.
- **Explicit Determination**:
  > **Because of no `Callie kids` match** (empty calendar feed for this date), the cOtherwise` rule was triggered. **This was determined to be Dad's (Chris in Franklin)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏠 Dad's ]`
  - **Parent**: Chris
  - **Town**: Franklin, MA
  - **Color**: Blue (`#2563eb`)

---

## 3. Summary Comparison Table (Aug 27 — Aug 31)

| Date | Calendar Event Found on `Aria and Ben` | Match Rule Applied | Calculated Custody Badge | Parent & Location |
| :--- | :--- | :--- | :--- | :--- |
|**Thu, Aug 27** | `Juliana�s bday Level99 in Natick (For Aria)` | No `Callie kids` match → Otherwise | `[ 🏠 Dad's ]` | Chris (Franklin, Blue) |
| **Fri, Aug 28** | `Callie Kids` | **Exact match on `Callie kids`** | `[ 🏦 Mom's ]` | Callie (Millis, Maroon) |
| **Sat, Aug 29** | `OSFC Girls U13 NEFC Tournament Pre-Fall` | No `Callie kids` match → Otherwise | `[ 🏠 Dad's ]` | Chris (Franklin, Blue) |
| **Sun, Aug 30** | *(No events)* | No `Callie kids` match → Otherwise | `[ 🏠 Dad's ]` | Callie (Franklin, Blue) |
| **Mon, Aug 31** | *(No events)* | No `Callie kids` match → Otherwise | `[ 🏠 Dad's ]` | Chris (Franklin, Blue) |

---

## 4. Key Takeaways & Observations

1. **Friday, August 28** is the **only day** in this 5-day window that has an explicit `Callie Kids` event on Google Calendar. It correctly resolves to **Mom's (Callie in Millis, Maroon)**.
2. On **Thursday, Saturday, Sunday, and Monday**, there is no `Callie Kids` entry on the calendar. Therefore, following the directive **"Otherwise, Dad's"**, all four days automatically resolve to **Dad's (Chris in Franklin, Blue)**.
3. If any of Saturday, Sunday, or Monday are actually Callie's parenting days, adding an all-day event named `Callie Kids` on Google Calendar will immediately flip the badge to **Mom's (Maroon)**.
