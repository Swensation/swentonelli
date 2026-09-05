# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
- **Household Family Members**:
  - **Dad (Andrew)**: System administrator, primary coordinator, developer, and driver.
  - **Moms (Liz & Callie)**: Co-parents coordinating schedules, activities, and household logistical handoffs across households.
  - **Kids**:
    - **Aria** (7th Grade, Millis Middle School): OSFC Soccer, therapy.
    - **Brighton** (6th Grade, Adams Middle School): Field hockey, Coastal Counseling.
    - **Benjamin** (5th Grade, Clyde F. Brown Elementary): Millis schools, therapy with Kelley.
    - **Bennett** (4th Grade, Miller School): Football, Holliston schools.
  - **Scout**: Family Beagle and titular mascot/intelligence persona.
- **Audience Mode**: Operates simultaneously as a shared kitchen kiosk (scannable from 6–10 feet) and personal mobile views for on-the-go parents and kids scanning the header QR code.

## Product Purpose
Scouty Planner eliminates household chaos and cognitive load by providing a real-time, glanceable single pane of glass for family schedules, school lunch menus, custody indicators, chore gig bounties, and home automations, backed by an autonomous engineering loop where family members can talk to Scout to request features and fixes.

## Positioning
Unlike commercial calendar apps (Google Calendar, Cozi) or static family whiteboard planners, Scouty Planner is a living cybernetic household operating system. It unifies disparate multi-school iCal feeds, PDF school lunch parsing, multi-household custody indicators, and real-world smart home hardware into an autonomous platform that heals and evolves itself via voice/text feedback ("Talk to the Beagle").

## Operating Context
- **Primary Kiosk Surface**: 1080p landscape touch display mounted in the kitchen. Needs large, clear touch targets and visual readability from across the room.
- **Secondary Mobile Surface**: Responsive portrait mobile view opened via iPhone/iPad camera scanning the master header QR code.
- **Input Modalities**: Touchscreen taps on kiosk, mobile touches, voice/text dictation via the "Talk to the Beagle" feedback modal.

## Capabilities and Constraints
- **Multi-Child Calendar Timeline**: 4-column side-by-side view (Aria, Brighton, Benjamin, Bennett) showing deterministic daily schedules.
- **Master Date Stepper**: Central header stepper (`<` `Selected Date` `>`) orchestrates all dashboard widgets simultaneously.
- **Multi-Household Custody Engine**: Deterministic color-coded custody badges (Mom Liz #dc2626 in Holliston, Dad Andrew #800020 in Millis, Mom Callie #800020 in Millis, Dad Chris #2563eb in Franklin) without layout shifts.
- **Automated Lunch Menus**: Ingests and parses district school lunch menus, rendering dietary and main course cards with interactive modal details.
- **Autonomous Engineering Harness**: Background cybernetic loop (`.harness`) with Triage, Coder, Evaluator, and Surgeon agents that auto-remediates bugs submitted to the Beagle.

## Brand Commitments
- **Namesake & Spirit**: Scout the Beagle. The interface is warm, playful, and approachable—never cold, intimidating, or sterile B2B enterprise SaaS.
- **Visual Identity**: Warm amber and earthy accents reflecting Scout's tricolor beagle coat, paired with crisp neutral slates.
- **Child Color Tokens**:
  - Aria: Vibrant purple/violet accent (#8b5cf6)
  - Brighton: Soft pink accent (#f472b6 / #ec4899)
  - Benjamin: Fresh green/cyan accent (#06b6d4 / #10b981)
  - Bennett: Energetic orange/amber accent (#f59e0b / #ea580c)
- **Anti-Patterns**: Strictly ban generic SaaS purple-to-blue gradients, low-contrast gray text on saturated colors, thick `border-l-4` side tabs on cards, bouncy animations that feel gimmicky, and cramped touch targets.

## Evidence on Hand
- Live dashboard running in production on Firebase App Hosting (`swentonelli--scouty-planner.us-east4.hosted.app`).
- Comprehensive family specification registry (`data/children.json`, `data/house_systems.json`).
- Autonomous test harness with 138+ automated unit and integration tests passing.

## Product Principles
1. **Glanceability Across the Kitchen**: A parent holding a coffee cup or cooking dinner must be able to understand the day's schedule from 8 feet away.
2. **Kid-Friendly Tactility**: Touch targets must be generous and forgiving (minimum 44x44px, preferably 48px+ on kiosk) for kids checking lunch or claiming chore bounties.
3. **Deterministic Unambiguity**: Custody indicators and school days must never be ambiguous or confusing across split households.
4. **Graceful Degradation**: If an external school lunch PDF or sports iCal feed is down or delayed, fallback gracefully without breaking the layout.
5. **Continuous Self-Improvement**: The Beagle listens to family feedback and routes actionable requests directly into the autonomous engineering harness.

## Accessibility & Inclusion
- WCAG AA contrast compliance across all text and badges.
- Large, distinct status badges that do not rely solely on color (paired with icons and explicit textual labels).
- Mobile and desktop keyboard/touch navigation support.
