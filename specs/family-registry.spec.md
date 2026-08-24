# Specification: Family & Child Profiles Registry

## 1. Overview & Purpose
The **Child Profiles Registry** is the central source of truth for each child's academic, athletic, medical, and personal metadata in the Swenson-Antonelli household.

This registry serves two key purposes:
1. **Automated Event Classification**: Ingests keywords, grade levels, teachers, therapists, and sports leagues so calendar invites automatically map to the correct child and display the right team/school crest.
2. **Family Information Hub**: Provides a single unified grid on the Admin Dashboard for parents and grandparents to view school details, therapists, and external sports schedule links.

---

## 2. Master Child Profiles Matrix

| Attribute / Field | 👧 Aria | 👧 Brighton | 👦 Benjamin | 👦 Bennett |
| :--- | :--- | :--- | :--- | :--- |
| **Child ID** | `aria` | `brighton` | `benjamin` | `bennett` |
| **Full Name** | Aria | Brighton | Benjamin | Bennett |
| **Avatar Theme** | Glinda (Galinda) from *Wicked* | Elphaba from *Wicked* | *Fortnite* Supply Llama | *Moe's Tavern* (*The Simpsons*) |
| **Signature Color** | Blue (`#3b82f6`) | Light Pink (`#f472b6`) | Red (`#ef4444`) | Green (`#22c55e`) |
| **School** | **Millis Middle School** (Millis) | **Adams Middle School** (Holliston) | **CFB (Clyde F. Brown)** (Millis) | **Miller Elementary School** (Holliston) |
| **Current Grade** | **7th Grade** | **6th Grade** | **5th Grade** | **4th Grade** |
| **Homeroom / Teacher** | Millis 7th Grade Team | Adams 6th Grade Team | CFB 5th Grade Team | **Katie Pellegri** (Ms. Pellegri) |
| **Pediatrician** | TBD | Dr. Urban (Holliston Pediatrics) | TBD | Dr. Urban (Holliston Pediatrics) |
| **Therapist** | **Coastal Counseling** | **Coastal Counseling** | **Kelley** | Therapy / Specialists |
| **Sport / Activity** | **Soccer** (OSFC Soccer) | **Field Hockey** | Youth Athletics | **Football** |
| **Custody Rule** | Mom (Callie) / Dad (Chris) | Mom (Liz) / Dad (Andrew) | Mom (Callie) / Dad (Chris) | Mom (Liz) / Dad (Andrew) |
| **Schedule Links** | [OSFC TeamSnap](https://teamsnapone.com) • [Millis School](https://millisps.org) | [Field Hockey League](https://hollistonyouthfieldhockey.com) • [Adams Calendar](https://holliston.k12.ma.us/adams) | [CFB Calendar](https://millisps.org) • [Youth Athletics](https://teamsnapone.com) | [Miller Calendar](https://holliston.k12.ma.us/miller) • [Football Schedule](https://teamsnapone.com) |
| **Matching Keywords** | `aria`, `millis`, `7th grade`, `seventh grade`, `coastal counseling`, `osfc`, `soccer` | `brighton`, `adams`, `6th grade`, `sixth grade`, `coastal counseling`, `field hockey`, `patoma` | `benjamin`, `ben `, `cfb`, `5th grade`, `fifth grade`, `kelley`, `fortnite` | `bennett`, `miller`, `4th grade`, `fourth grade`, `grade 4`, `pellegri`, `katie pellegri`, `football` |

---

## 3. Architectural Integration
- **JSON Store**: `data/children_registry.json`
- **Helper Module**: `src/lib/childrenRegistry.ts`
- **Rules Engine Integration**: `src/lib/eventRules.ts` resolves child by matching keywords and grade levels against this registry.
- **Admin Dashboard**: `/admin` renders the **"Child Profiles & Schedules"** tab presenting this exact matrix interactively.

