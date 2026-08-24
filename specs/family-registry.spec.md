# Specification: Family & Child Profiles Registry

## 1. Overview & Purpose
The **Child Profiles Registry** is the central source of truth for each child's academic, athletic, medical, and personal metadata in the Swenson-Antonelli household.

This registry serves two key purposes:
1. **Automated Event Classification**: Ingests keywords, grade levels, teachers, therapists, and sports leagues so calendar invites automatically map to the correct child and display the right team/school crest.
2. **Family Information Hub**: Provides a clean visual grid on the Admin Dashboard for parents and grandparents to view school details, therapists, and external sports schedules (TeamSnap, GameChanger, etc.).

---

## 2. Master Child Profiles Matrix

| Attribute / Field | 👧 Aria | 👧 Brighton | 👦 Benjamin | 👦 Bennett |
| :--- | :--- | :--- | :--- | :--- |
| **Child ID** | `aria` | `brighton` | `benjamin` | `bennett` |
| **Full Name** | Aria | Brighton | Benjamin | Bennett |
| **Avatar Theme** | Glinda (Galinda) from *Wicked* | Elphaba from *Wicked* | *Fortnite* Supply Llama | *Moe's Tavern* (The Simpsons) |
| **Signature Color** | Blue (`#3b82f6`) | Light Pink (`#f472b6`) | Red (`#ef4444`) | Green (`#22c55e`) |
| **School** | Adams Middle School | Miller Elementary School | Holliston Public Schools | Miller Elementary School |
| **Current Grade** | 8th Grade | 5th Grade | 6th Grade / TBD | 4th Grade |
| **Homeroom / Teacher** | Middle School Team | TBD | TBD | **Katie Pellegri** (Ms. Pellegri) |
| **Pediatrician** | Holliston Pediatric Group | Dr. Urban (Holliston Pediatrics) | Holliston Pediatric Group | Dr. Urban (Holliston Pediatrics) |
| **Therapist / Specialists**| Speech & OT Therapy | Therapy Clinic | **Kelly** (Therapist) | Therapy / Specialists |
| **Primary Sport / Team** | **OSFC Soccer** (Old School FC U13) | **Holliston Field Hockey** | Youth Athletics / TBD | Youth Soccer / Flag Football |
| **Secondary Activities** | Dance / Performing Arts | Dance / Arts | Gaming / Activities | Rec Sports |
| **Custody Rule** | Mom (Callie) / Dad (Chris) | Mom (Liz) / Dad (Andrew) | Mom (Callie) / Dad (Chris) | Mom (Liz) / Dad (Andrew) |
| **Keywords for Matching** | `aria`, `osfc`, `old school`, `u13`, `8th grade` | `brighton`, `field hockey`, `patoma`, `5th grade` | `benjamin`, `ben `, `kelly`, `fortnite` | `bennett`, `4th grade`, `pellegri`, `katie pellegri` |

---

## 3. External Schedule & Share Links (For Grandparents & Family)

| Child | Activity | Provider / App | Schedule & Link Details |
| :--- | :--- | :--- | :--- |
| **Aria** | OSFC Girls U13 Soccer | TeamSnap / League Athletics | `https://teamsnapone.com` |
| **Brighton** | Holliston Youth Field Hockey | LeagueApps / TeamSnap | `https://hollistonyouthfieldhockey.com` |
| **Bennett** | 4th Grade Classroom & Rec | School District / TeamSnap | `https://holliston.k12.ma.us/miller` |
| **Benjamin** | Youth Sports & Activities | TeamSnap / Portal | `https://teamsnapone.com` |

---

## 4. Architectural Integration
- **JSON Store**: `data/children_registry.json`
- **Helper Module**: `src/lib/childrenRegistry.ts`
- **Rules Engine Integration**: `src/lib/eventRules.ts` resolves child by matching keywords and grade levels against this registry.
- **Admin Dashboard**: `/admin` renders a dedicated **"Child Profiles"** tab presenting this matrix interactively.
