# Spec: Swentonelli Family Profiles & Member Specifications

> **Status**: Draft / In Review  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose
This specification documents the Swentonelli family members to personalize widgets, tailor kid-driven features, assign individual calendar color themes, and guide future widget creations (e.g. chore charts, reading logs, sports trackers, pet care).

---

## 2. Family Members

### The Kids (4 Children)

#### 1. Aria
- **Role**: Daughter
- **Age**: *(TBD)*
- **School / Grade**: *(TBD)*
- **Calendar Theme Color**: `#ec4899` (Vibrant Pink / Rose)
- **Activities & Interests**: *(e.g. Dance, Music, Sports)*
- **Planned / Suggested Widgets**: Reading tracker, personal daily checklist

#### 2. Brighten
- **Role**: Child
- **Age**: *(TBD)*
- **School / Grade**: *(TBD)*
- **Calendar Theme Color**: `#f59e0b` (Warm Amber / Gold)
- **Activities & Interests**: *(e.g. Art, Robotics, Sports)*
- **Planned / Suggested Widgets**: Goal tracker, daily routine checklist

#### 3. Benjamin
- **Role**: Son
- **Age**: *(TBD)*
- **School / Grade**: *(TBD)*
- **Calendar Theme Color**: `#3b82f6` (Royal Blue)
- **Activities & Interests**: *(e.g. Soccer, Gaming, STEM)*
- **Planned / Suggested Widgets**: Sports schedule, chore progress bar

#### 4. Bennett
- **Role**: Son
- **Age**: *(TBD)*
- **School / Grade**: *(TBD)*
- **Calendar Theme Color**: `#10b981` (Emerald Green)
- **Activities & Interests**: *(e.g. Swimming, Scouts, Karate)*
- **Planned / Suggested Widgets**: Star chart, countdown to weekend

---

### Parents & Pets

#### Scout 🐶
- **Breed**: Beagle (The namesake for the **Scouty Planner**)
- **Planned / Suggested Widgets**: Dog walking tracker, feeding schedule, treat counter

#### Dad (Andrew) & Mom
- **Calendar Theme Colors**:
  - Dad: `#8b5cf6` (Purple)
  - Mom: `#06b6d4` (Teal / Cyan)
  - Shared Family Calendar: `#3b82f6` (Blue)

---

## 3. Calendar Source Mapping (`.env.local`)

Each family member and school feed can be mapped directly to a distinct Google Calendar feed in `.env.local`:

| Member / Feed | Source ID | Color Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Family Shared** | `family` | `#3b82f6` (Blue) | Main family events & dinners |
| **Aria** | `aria` | `#ec4899` (Pink) | Lessons, practices & school events |
| **Brighten** | `brighten` | `#f59e0b` (Amber) | Clubs, activities & sports |
| **Benjamin** | `benjamin` | `#3b82f6` (Blue) | Practices, games & school |
| **Bennett** | `bennett` | `#10b981` (Green) | Classes, playdates & sports |
| **Mom** | `mom` | `#06b6d4` (Cyan) | Mom's schedule & appointments |
| **Dad** | `dad` | `#8b5cf6` (Purple) | Dad's schedule & work trips |
| **School District** | `school` | `#f97316` (Orange) | District days off & early releases |

---

## 4. Open Questions & Future Customizations
- [ ] Add specific ages, birthdays, and school grades for Aria, Brighten, Benjamin, and Bennett.
- [ ] Assign who gets to build which widget first when the kids start coding!

