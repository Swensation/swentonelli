# Custody & Household Rules: Mom's vs. Dad's

This document explains the custody schedule logic, color encoding, calendar triggers, and known discrepancies between how **Mom's** and **Dad's** badges are calculated across the family calendar.

---

## 1. Household Structure & The Four Children

The Swenson-Antonelli family combines two family branches into one home in **Millis, MA**:

| Child | Age / Grade | School | Mom | Dad | Primary Custody Axis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brighton** | 6th Grade | Adams Middle School (Holliston) | **Liz** (Holliston) | **Andrew** (Millis) | Liz (Mom) ⟷ Andrew (Dad) |
| **Bennett** | 4th Grade | Miller Elementary School (Holliston) | **Liz** (Holliston) | **Andrew** (Millis) | Liz (Mom) ⟷ Andrew (Dad) |
| **Aria** | 7th Grade | Millis Middle School (Millis) | **Callie** (Millis) | **Chris** (Franklin) | Callie (Mom) ⟷ Chris (Dad) |
| **Benjamin** | 5th Grade | Clyde F. Brown Elementary (Millis) | **Callie** (Millis) | **Chris** (Franklin) | Callie (Mom) ⟷ Chris (Dad) |

---

## 2. Location & Color Matrix

The dashboard uses signature background colors to eliminate confusion over physical locations:

| Parent | Household Location | Signature Color | Hex Code | Dashboard Badge Label | Badge Style |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Andrew & Callie** | **Millis, MA** (Home Base) | **Maroon** | #800020 | [ 🏠 Dad's ] (for Brighton/Bennett)<br>[ 🏡 Mom's ] (for Aria/Benjamin) | bg-[#800020] text-white border-[#9f1239] |
| **Liz** | **Holliston, MA** | **Red** | #dc2626 | [ 🏡 Mom's ] (for Brighton/Bennett) | bg-red-600 text-white border-red-400 |
| **Chris** | **Franklin, MA** | **Blue** | #2563eb | [ 🏠 Dad's ] (for Aria/Benjamin) | bg-blue-600 text-white border-blue-400 |

> [!IMPORTANT]
> **Key Household Rule**:
> - When **Maroon** is shown on both columns, **ALL FOUR CHILDREN ARE TOGETHER AT HOME IN MILLIS**.
> - Notice that for Brighton & Bennett, Millis is **Dad's**, while for Aria & Benjamin, Millis is **Mom's**!

---

## 3. How the Rules Engine Extracts Custody from Calendar Feeds

The system parses Google Calendar feeds in real time via src/lib/annotations.ts:

### A. Brighton & Bennett (Feed: Brighton and Bennett)
- **Mom's (Liz in Holliston - Red)**:
  - Trigger Keywords: "Liz kids", "Liz Kids", "with Liz", "Liz has kids", "Liz ... vacation".
  - Action: Sets badge to **Mom's** with **Red** styling (#dc2626).
- **Dad's (Andrew in Millis - Maroon)**:
  - Trigger Keywords: "Andrew kids", "Andrew Kids", "Swen kids", "with Andrew", "with Swen", "Andrew has kids", "Swen has kids", "Andrew/Swen ... vacation".
  - Action: Sets badge to **Dad's** with **Maroon** styling (#800020).
- **Missing Event Fallback**:
  - If neither keyword is present on a day, **no custody badge is rendered** (undefined).

---

### B. Aria & Benjamin (Feed: Aria and Ben)
- **Mom's (Callie in Millis - Maroon)**:
  - Trigger Keywords: "Callie kids", "Callie Kids", "with Callie", "Callie ... vacation".
  - Action: Sets badge to **Mom's** with **Maroon** styling (#800020).
- **Dad's (Chris in Franklin - Blue)**:
  - Trigger: **Fallback default**. If the day does *not* have an explicit "Callie kids" event, the code automatically defaults to **Dad's (Chris in Franklin)** with **Blue** styling (#2563eb).

---

## 4. Root Causes of Observed Discrepancies

If you are noticing discrepancies on the dashboard, they stem from three specific factors:

### Discrepancy 1: Events Logged as Just "Kids " on the Aria & Ben Calendar
- **What Happened**: Throughout June, July, and early August 2026, events on the Aria and Ben calendar were titled simply "Kids " (or "Kids"), rather than "Callie kids".
- **The Bug**:
  - The filtering engine recognized "Kids " as an annotation and hid it from the timeline card stream.
  - However, the custody extractor strictly looked for "callie kid".
  - Because it did not match "callie", it triggered the fallback: **Dad's (Chris in Franklin - Blue)**!
  - **Result**: On days when Callie had the kids, the dashboard erroneously showed [ 🏠 Dad's ] (Blue / Franklin).
- **The Fix**: The extractor should treat "Kids " on the Aria and Ben calendar as Callie's parenting days.

---

### Discrepancy 2: "Mom's" vs "Dad's" Label Confusion on Joint Millis Days
- **What Happens**: On a day when all four children are home together in Millis with Andrew and Callie:
  - Brighton & Bennett show [ 🏠 Dad's ] (because Andrew is their dad).
  - Aria & Benjamin show [ 🏡 Mom's ] (because Callie is their mom).
- **The Perception**: Looking at the columns, one might think the children are in two different places because one says "Dad's" and the other says "Mom's".
- **The Reality**: They are in the exact same house! Both badges are **Maroon** (#800020).
- **Potential Improvement**: We could display [ Millis ], [ Holliston ], or [ Franklin ], or parent first names ([ Andrew ], [ Callie ], [ Liz ], [ Chris ]) to avoid label collision.

---

### Discrepancy 3: Asymmetric Fallback Logic
- **Brighton & Bennett**: When the calendar is unpopulated (no entry for the day), **no badge** is displayed.
- **Aria & Benjamin**: When the calendar is unpopulated, it **automatically assumes Chris in Franklin**.
- **Result**: On future months where neither parent has populated the custody schedule yet, Aria and Ben appear to be permanently at Chris's house in Franklin, while Brighton and Bennett show no custody badge.

---

## 5. Summary Cheat Sheet

| Day Event on Google Calendar | Brighton & Bennett Badge | Aria & Benjamin Badge | Actual Location |
| :--- | :--- | :--- | :--- |
| "Andrew kids" + "Callie kids" | [ 🏠 Dad's ] (Maroon) | [ 🏡 Mom's ] (Maroon) | **Together in Millis** |
| "Liz kids" + (No Callie entry) | [ 🏡 Mom's ] (Red) | [ 🏠 Dad's ] (Blue) | **Split**: Brighton/Bennett in Holliston, Aria/Ben in Franklin |
| "Andrew kids" + (No Callie entry) | [ 🏠 Dad's ] (Maroon) | [ 🏠 Dad's ] (Blue) | **Split**: Brighton/Bennett in Millis, Aria/Ben in Franklin |
| "Liz kids" + "Callie kids" | [ 🏡 Mom's ] (Red) | [ 🏡 Mom's ] (Maroon) | **Split**: Brighton/Bennett in Holliston, Aria/Ben in Millis |
| No entry on either calendar | *No badge* | [ 🏠 Dad's ] (Blue - Fallback) | *Uncertain / Schedule not logged* |

---

## 6. How to Resolve Any Discrepancy
To adjust any of these rules or resolve discrepancies:
1. **Calendar entry names**: Entering "Callie kids" (or "Callie Kids") and "Liz kids" / "Andrew kids" will guarantee 100% accurate badge matching.
2. **Code adjustments**: We can update src/lib/annotations.ts to support "Kids " as Callie's days or revise the fallback rules to match your exact parenting rotation.
