---
name: Scouty Planner Design System
description: Warm, glanceable family kitchen kiosk and mobile operational planner
colors:
  primary: "#d97706"
  primary-hover: "#b45309"
  primary-subtle: "#fef3c7"
  background: "#0f172a"
  surface: "#1e293b"
  surface-card: "#1e293b"
  surface-hover: "#334155"
  border: "#334155"
  border-subtle: "#1e293b"
  text-primary: "#f8fafc"
  text-secondary: "#cbd5e1"
  text-muted: "#94a3b8"
  text-on-primary: "#ffffff"
  aria-accent: "#8b5cf6"
  brighton-accent: "#f472b6"
  benjamin-accent: "#06b6d4"
  bennett-accent: "#f59e0b"
  custody-andrew: "#800020"
  custody-liz: "#dc2626"
  custody-callie: "#800020"
  custody-chris: "#2563eb"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.025em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  header-ribbon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  date-stepper-btn:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  child-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
  custody-badge:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Scouty Planner Design System

## Overview
Scouty Planner is designed for high-glanceability and effortless touch interaction. It serves as both a central kitchen counter kiosk display and an on-demand mobile dashboard. The visual language balances warm, cheerful Beagle personality with crisp, unambiguous information hierarchy.

## Colors
- **Warm Beagle Brand**: Warm Amber (`#d97706` / `#b45309`) acts as the anchor accent, honoring Scout.
- **Dark Kiosk Foundation**: Dark Slate palette (`#0f172a` canvas, `#1e293b` cards, `#334155` borders) maximizes contrast under bright kitchen lighting and prevents eye fatigue.
- **Child Color Accents**:
  - **Aria**: Royal Violet (`#8b5cf6`)
  - **Brighton**: Soft Warm Rose/Pink (`#f472b6`)
  - **Benjamin**: Energetic Cyan (`#06b6d4`)
  - **Bennett**: Cheerful Amber/Orange (`#f59e0b`)
- **Household Custody Palette**:
  - Mom Liz (Holliston): Red (`#dc2626`)
  - Dad Andrew (Millis): Deep Maroon (`#800020`)
  - Mom Callie (Millis): Deep Maroon (`#800020`)
  - Dad Chris (Franklin): Royal Blue (`#2563eb`)
- **Contrast Rule**: All text over badges or colored backgrounds must use crisp high-contrast white (`#ffffff`) or deep dark tinted text (`#020617`). Never use un-tinted mid-grays on color.

## Typography
- **Primary Typeface**: Native high-clarity system sans-serif stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Hierarchy**:
  - **Kiosk Header Title**: `clamp(1.5rem, 2.5vw, 2.25rem)` bold, commanding presence.
  - **Date Stepper**: `1.25rem` medium weight, tabular numerals for zero jitter on stepping.
  - **Child Names**: `1.125rem` bold, paired with larger 48px+ avatars.
  - **Timeline Events**: `0.9375rem` semibold title with `0.8125rem` muted details.

## Layout
- **Kiosk View (Landscape)**:
  - Top: Ribbon header housing the Scout avatar, master title, unified date stepper (`< Date >`), and mobile QR scan button.
  - Main Body: 4-column balanced grid dividing the screen evenly between Aria, Brighton, Benjamin, and Bennett.
- **Mobile View (Portrait)**:
  - Sticky compact date ribbon.
  - Swipeable child tabs or stacked vertical accordion view for single-handed use.

## Elevation & Depth
- **Tonal Layering Over Muddy Shadows**: Surfaces layer naturally via `bg-slate-900` ➔ `bg-slate-800` ➔ `bg-slate-700/60` with thin `border-slate-700/80` borders.
- Avoid heavy, blurry drop-shadows that look dirty on touchscreen displays.

## Shapes
- Generous, organic corner radiuses (`rounded-xl` for cards, `rounded-full` for status chips and badges) creating a welcoming, tactile aesthetic.
- Avatars must feature consistent neutral borders with sufficient padding to prevent clipping.

## Components
- **ChildHeader**: Displays child avatar, name, grade, school badge, and deterministic custody pill without causing layout shift.
- **ActivityCard**: Compact, scannable calendar events featuring external team/school logos, start/end times, and category tags.
- **TalkToTheBeagle Modal**: Accessible, friendly voice/text input modal with Scout mascot illustration.
- **QR Code Modal**: High-contrast, scannable QR overlay easily captured by mobile cameras from across the kitchen island.

## Do's and Don'ts
- **DO** use generous touch targets (minimum 44x44px for buttons, chips, and date steppers).
- **DO** tint dark neutral backgrounds and text toward slate/amber for visual cohesion.
- **DO** pair color indicators with icons or textual labels for accessibility.
- **DON'T** use thick `border-l-4` side-tabs on cards (common AI slop tell). Use subtle tonal card borders and explicit tag chips.
- **DON'T** place gray text on colored backgrounds. Saturated badges must use pure white text or dark tinted text.
- **DON'T** use bouncy or elastic easing (`animate-bounce`). Use smooth cubic bezier / exponential deceleration.
- **DON'T** use generic purple-to-blue or cyan-to-violet AI gradients. Stick to the curated Scouty palette.
