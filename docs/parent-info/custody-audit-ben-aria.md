# Custody Calculation Audit: Ben & Aria (Aug 27 – Aug 31, 2026)

This document provides a day-by-day audit explaining exactly how the custody badges are calculated for **Benjamin** and **Aria** from **Thursday, August 27** through **Monday, August 31, 2026**.

---

## 1. Presence-Based Custody Rule

As established:
> **The rules for custody should consider not 'an event that started on this date' but 'an event that has a presence during any time that falls on this date'. So if 'Callie Kids' does span across a Saturday and it touches that Saturday, it's a hit for Callie kids.**

Under this rule:
1. **Active Match `Callie kids``:
   - If an event named `Callie kids` (or `Callie Kids`) has active presence during any time that falls on that date:
   - **Determined**: **Mom's (Callie in Millis, MA — Maroon `800020`)**.
2. **Active Match `Chris kids``:
   - If an event named `Chris kids` is active or touches any time on that date:
   - **Determined**: **Dad's (Chris in Franklin, MA — Blue `2563eb`*)**.
3. **Conflict / Error Fallback**:
   - If both appear on the same date:
   - **Determined**: **`[�j� ! ]` (Conflicted Schedule — Amber `b45309`)**.
4. **Otherwise (No Matching Custody Presence)**:
   - If no custody indicator is present on that date:
   - **Determined**: **Dad's (Chris in Franklin, MA — Blue `2563eb`)**.

---

## 2. The Spanning Event: `Callie Kids`

From the raw Google Calendar feed for `Aria and Benk (iCalendar data):
- **Summary**: `Callie Kids`
- **Start**: Friday, August 28, 2026 at 12:00 PM EDT (2026-08-28T16:00:00Z)
- **End**: Monday, August 31, 2026 at 12:00 PM EDT (2026-08-31T16:00:00Z)
- **Span**: 72 hours across **Friday, Saturday, Sunday, and Monday**.

---

## 3. Day-by-Day Audit & Match Determinations

### Day 1: Thursday, August 27, 2026 (Today)
- **Active Events on Calendar**:
  - `[Aria and Ben]`: `Juliana’s bday Level99 in Natick (For Aria)`
  - `[Aria and Ben]`: `OSFC Girls U13 NEFC Tournament Pre-Fall`
- **Rule Matching Evaluation**:
  - Neither event matches `callie kids`.
  - The `Callie Kids` weekend span has not yet started.
- **Explicit Determination**:
  > **Because of no active `Callie kids` presence** on Thursday, August 27, the *"Otherwise"* rule was triggered. **This was determined to be Dad's (Chris in Franklin)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏠 Dad's ]`
  - **Parent**: Chris
  - **Town**: Franklin, MA
  - **Color**: Blue (`#2563eb`)

---

### Day 2: Friday, August 28, 2026
- **Active Events on Calendar**:
  - `[Aria and Ben]`: `Callie Kids` (Starts 12:00 PM EDT)
  - `[Aria and Ben]`: `OSFC Girls U13 NEFC Tournament Pre-Fall`
- **Rule Matching Evaluation**:
  - `Callie Kids` begins and touches Friday.
- **Explicit Determination**:
  > **Because of this exact match on `Callie Kids`**, **this was determined to be Mom's (Callie in Millis)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏦 Mom's ]`
  - **Parent**: Callie
  - **Town**: Millis, MA
  - **Color**: Maroon (`#800020`)

---

### Day 3: Saturday, August 29, 2026
- **Active Events on Calendar**:
  - `[Aria and Ben]`: `Callie Kids` (All-day active presence)
  - `[Aria and Ben]`: `OSFC Girls U13 NEFC Tournament Pre-Fall`
- **Rule Matching Evaluation**:
  - The multi-day `Callie Kids` event spans across Saturday. It has an active presence throughout the entire day.
- **Explicit Determination**:
  > **Because of this active presence match on `Callie Kids` spanning across Saturday**, **this was determined to be Mom's (Callie in Millis)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏦 Mom's ]`
  - **Parent**: Callie
  - **Town**: Millis, MA
  - **Color**: Maroon (`#800020`)

---

### Day 4: Sunday, August 30, 2026
- **Active Events on Calendar**:
  - `[Aria and Ben]`: `Callie Kids` (All-day active presence)
- **Rule Matching Evaluation**:
  - The multi-day `Callie Kids` event spans across Sunday. It has an active presence throughout the entire day.
- **Explicit Determination**:
  > **Because of this active presence match on `Callie Kids` spanning across Sunday**, **this was determined to be Mom's (Callie in Millis)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏦 Mom's ]`
  - **Parent**: Callie
  - **Town**: Millis, MA
  - **Color**: Maroon (`#800020`)

---

### Day 5: Monday, August 31, 2026
- **Active Events on Calendar**:
  - `[Aria and Ben]`: `Callie Kids` (Active presence until 12:00 PM EDT)
- **Rule Matching Evaluation**:
  - The `Callie Kids` event concludes at 12:00 PM on Monday. Because it touches Monday morning, it is a hit for Callie kids.
- **Explicit Determination**:
  > **Because of this active presence match on `Callie Kids` touching Monday**, **this was determined to be Mom's (Callie in Millis)**.
- **Resulting Dashboard Badge**:
  - **Badge**: `[ 🏦 Mom's ]`
  - **Parent**: Callie
  - **Town**: Millis, MA
  - **Color**: Maroon (`#800020`)

---

## 4. Summary Table: Ben & Aria (Aug 27 – Aug 31)

| Date | Events on Calendar | Presence Evaluation | Calculated Custody Badge | Parent & Town |
e| :--- | :--- | :--- | :--- | :--- |
| **Thu, Aug 27** | Level99 bday & Tournament | No Callie presence → Otherwise | `[ 🏠 Dad's ]` | Chris (Franklin, Blue) |
| **Fri, Aug 28** | `Callie Kids` (starts 12pm) | **Hit**: Exact match on `Callie Kids` | `[ 🏦 Mom's ]` | Callie (Millis, Maroon) |
| **Sat, Aug 29** | `Callie Kids` (spans all day) | **Hit**: Active presence for `Callie Kids` | `[ 🏦 Mom's ]` | Callie (Millis, Maroon) |
| **Sun, Aug 30** | `Callie Kids` (spans all day) | **Hit**: Active presence for `Callie Kids` | `[ 🏦 Mom's ]` | Callie (Millis, Maroon) |
| **Mon, Aug 31** | `Callie Kids` (until 12pm) | **Hit**: Active presence for `Callie Kids` | `[ 🏦 Mom's ]` | Callie (Millis, Maroon) |

---

## 5. Household Alignment (Both Kid Pairs)

With presence-based indexing active:
- o*Friday, Aug 28**: Brighton & Bennett at Dad's (Andrew in Millis, Maroon), Aria & Ben at Mom's (Callie in Millis, Maroon) → **ALL 4 KIDS TOGETHER IN MILLIS!**
- **Saturday, Aug 29**: Brighton & Bennett at Dad's (Andrew in Millis, Maroon), Aria & Ben at Mom's (Callie in Millis, Maroon) → **ALL 4 KIDS TOGETHER IN MILLIS!**
