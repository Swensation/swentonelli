# Specification: Calendar Annotations & Badges

## 1. Overview & Purpose
Calendar events frequently contain high-level state, custody arrangements, or district-wide status rather than standard timed activities. 

To prevent visual clutter, **Annotations & Badges** are extracted from the raw calendar feed, filtered out of the chronological timeline cards, and elevated into prominent **status badges** displayed directly in the child's column header and/or top of the calendar.

---

## 2. Custody Annotation Specification

### A. Brighton & Bennett
- **Household Context**: Brighton and Bennett spend half their time with their mother Liz and half with their father Andrew (Swen).
- **Classification Rules**:
  - **With Mom (Liz)**:
    - **Trigger**: Event title contains `"Liz kids"`.
    - **Badge Display**: `[ 🏡 With Mom ]` (Emerald/Green home pill) or `[ 🏡 Liz's House ]`.
  - **With Dad (Andrew / Swen)**:
    - **Trigger**: Event title contains `"Andrew kids"` or `"Swen kids"`.
    - **Badge Display**: `[ 🏠 With Dad ]` (Amber/Gold home pill) or `[ 🏠 Dad's House ]`.

### B. Benjamin & Aria
- **Household Context**: Benjamin and Aria spend half their time with their mother Callie and half with their father Chris.
- **Classification Rules**:
  - **With Mom (Callie)**:
    - **Trigger**: Event title contains `"Callie kids"`.
    - **Badge Display**: `[ 🏡 With Mom ]` (Emerald/Green home pill) or `[ 🏡 Callie's House ]`.
  - **With Dad (Chris)**:
    - **Trigger**: Default state when not with Callie (or events referencing Chris/Dad).
    - **Badge Display**: `[ 🏠 With Dad ]` (Blue/Indigo home pill) or `[ 🏠 Dad's House ]`.

### C. UI Presentation Rules
- **No Timeline Clutter**: Custody events (e.g. all-day `"Liz kids"` or `"Callie kids"`) MUST NOT render as standard activity cards in the timeline.
- **Column Header Placement**: Rendered directly beneath the child's name/avatar in their respective column.

---

## 3. "No School" & District Schedule Badges

### A. Classification Rules
- **Triggers**:
  - Event title or description contains: `"no school"`, `"school closed"`, `"holiday - no school"`, `"teacher professional day"`, `"professional development"`, `"summer break"`, `"winter break"`, `"spring break"`, `"vacation"`.
  - Half-Day / Early Release triggers: `"early release"`, `"half day"`, `"early dismissal"`.
- **Target Child Mapping**:
  - If event mentions `"adams"` or source is Aria/Ben $\rightarrow$ applies to **Aria**.
  - If event mentions `"miller"` or source is Brighton/Bennett $\rightarrow$ applies to **Brighton**.
  - If event mentions `"placentino"` $\rightarrow$ applies to **Bennett** (and Brighton).
  - If general `"Holliston Public Schools"` $\rightarrow$ applies to all school-age children.

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
 • Filter out custody/no-school         • Custody: { status, parent, label }
 • Chronological timeline display       • School: { status, label }
                                        • Rendered in Column Headers
```

