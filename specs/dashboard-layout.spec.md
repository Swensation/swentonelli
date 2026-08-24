# Spec: Dashboard Layout & Visual Design (Scouty Planner)

> **Status**: Approved / In Progress  
> **Author**: Dad (Andrew)  
> **Last Updated**: 2026-08-24  

---

## 1. Purpose & Branding
- **Name**: **Scouty Planner** 🐶 (Named after Scout, the family Beagle).
- **Aesthetic**: Ultra-clean, ribbon-style top header with instant mobile onboarding via QR Code.

---

## 2. Ribbon-Style Top Header

### Clean Left-to-Right Flow with QR Code on Right
```
+---------------------------------------------------------------------------------------+
| [ 🐶 Scout Photo ] Scouty Planner  |  [ < ]  Monday, Aug 24, 2026  [ > ]     [ 📱 QR ]|
+---------------------------------------------------------------------------------------+
```

### Key Elements:
1. **Left Section**:
   - Scout Photo Avatar (`/scout.jpeg`).
   - Bold **"Scouty Planner"** title.
   - Master Date Stepper: **`<` `Date Chip` `>`** controlling all dashboard widgets in unison.
2. **Right Section**:
   - **QR Code Button**: Compact QR code icon on the right side of the header.
   - **Interactive Modal**: Tapping the QR code expands a large, high-contrast QR code overlay that can be scanned from across the kitchen by iPhone / iPad cameras to open the dashboard immediately on mobile.

---

## 3. Widget Layout
- Pure 2-widget side-by-side presentation:
  - **Left Column (7 cols)**: Family Calendar (strictly presenting events for the master selected date).
  - **Right Column (5 cols)**: School Lunch (strictly presenting the lunch menu for the master selected date).

---

## 4. Acceptance Criteria Checklist
- [x] Header features small QR code button on the right side.
- [x] Clicking the QR code opens a large, high-contrast modal with scannable QR code.
- [x] QR code automatically encodes local LAN IP or cloud production URL.
- [x] `npm test` passes with zero failures.
