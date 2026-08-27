# Specification: Calendar Annotations & Badges

## 1. Overview & Purpose
Calendar events frequently contain high-level state, custody arrangements, or district-wide status rather than standard timed activities. 

To prevent visual clutter, **Annotations & Badges** are extracted from the raw calendar feed, filtered out of the chronological timeline cards, and elevated into prominent **status badges** displayed directly in the child's column header and/or top of the calendar.

---

## 2. Custody Annotation Specification & Color Encoding

### A. Location & Color Matrix
| Parent | Household Location | Signature Badge Color | Color Code | TailWind Styling |
| :--- | :--- | :--- | :--- | :--- |
| **Chris** (Dad for Aria & Benjamin) | **Franklin** | **Blue** | `#2563eb` / `#3b82f6` | `bg-blue-600/25 text-blue-300 border-blue-500/50` |
| **Liz** (Mom for Brighton & Bennett) | **Holliston** | **Red** | `#dc2626` / `#ef4444` | `bg-red-600/25 text-red-300 border-red-500/50` |
| **Andrew & Callie** (Dad for Brighton/Bennett, Mom for Aria/Benjamin) | **Millis** | **Maroon** | `#800020` / `#9f1239` | `bg-[#800020]/30 text-rose-300 border-[#9f1239]/60` |

### B. Classification & Naming Rules

#### 1. Brighton & Bennett
- **Household Context**: Brighton and Bennett spend half their time with their mother Liz (Holliston) and half with their father Andrew (Millis).
- **Rules**:
  - **Mom's (Liz - Holliston, Red)**:
    - **Trigger**: Event title is exactly `"Liz kids"` (case-insensitive).
    - **Badge Display**: `[ 🏡 Mom's ]` with **Red** styling (`bg-red-600 text-white border-red-400`).
  - **Dad's (Andrew - Millis, Maroon)**:
    - **Trigger**: Otherwise (default/normal state, or `"Andrew kids"` / `"Swen kids"`).
    - **Badge Display**: `[ 🏠 Dad's ]` with **Maroon** styling (`bg-[#800020] text-white border-[#9f1239]`).
  - **Error Fallback**:
    - **Trigger**: Conflicting events on the same date (e.g. both `"Liz kids"` and `"Andrew kids"`) or unexpected data.
    - **Badge Display**: `[ ⚠️ ! ]` with **Amber** styling (`bg-amber-600 text-white border-amber-400 font-black`).

#### 2. Benjamin & Aria
- **Household Context**: Benjamin and Aria spend half their time with their mother Callie (Millis) and half with their father Chris (Franklin).
- **Rules**:
  - **Mom's (Callie - Millis, Maroon)**:
    - **Trigger**: Event title is exactly `"Callie kids"` (case-insensitive).
    - **Badge Display**: `[ 🏡 Mom's ]` with **Maroon** styling (`bg-[#800020] text-white border-[#9f1239]`).
  - **Dad's (Chris - Franklin, Blue)**:
    - **Trigger**: Otherwise (default/normal state, or `"Chris kids"`).
    - **Badge Display**: `[ 🏠 Dad's ]` with **Blue** styling (`bg-blue-600 text-white border-blue-400`).
  - **Error Fallback**:
    - **Trigger**: Conflicting events on the same date (e.g. both `"Callie kids"` and `"Chris kids"`) or unexpected data.
    - **Badge Display**: `[ ⚠️ ! ]` with **Amber** styling (`bg-amber-600 text-white border-amber-400 font-black`).

### C. UI Presentation Rules
- **No Timeline Clutter**: Custody events (e.g. all-day `"Liz kids"` or `"Callie kids"`) MUST NOT render as standard activity cards in the timeline.
- **Top-Right Justified Header Badge**: Placed in the top-right corner of each child's column header, strictly on one line with fixed width (`w-[76px]`).
- **Pronounced Box Border**: Each child column's outer container features a prominent `border-2` styled with that child's signature color so the column pops, while child avatars retain clean neutral circular borders.

---

## 3. "No School" & District Schedule Badges

### A. Classification Rules
- **Triggers**:
  - Event title or description contains: `"no school"`, `"school closed"`, `"holiday - no school"`, `"teacher professional day"`, `"professional development"`, `"summer break"`, `"winter break"`, `"spring break"`, `"vacation"`.
  - Half-Day / Early Release triggers: `"early release"`, `"half day"`, `"early dismissal"`.

### B. Badge Presentation
- **No School Badge**: `[ 🏫 No School ]` (Red/Rose pill with school building icon).
- **Early Release Badge**: `[ ⏰ Early Release ]` (Amber pill with clock/bell icon).
- **Timeline Exclusion**: These informational district banners are excluded from standard activity cards.

---

## 4. Architectural Data Pipeline

```
[ Raw ICS Events ] ➔ [ Annotations Extractor (src/lib/annotations.ts) ]
                                │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ Regular Activity Cards ]             [ Child & Day Badges ]
 • Filter out custody/no-school         • Custody: { status, parent, town, color, label }
 • Chronological timeline display       • School: { status, label }
                                        • Rendered in Column Headers
```
