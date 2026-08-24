# Spec: Daily Dad Joke Widget

> **Status**: Implemented (Starter Template)  
> **Author**: Kids & Dad  
> **Last Updated**: 2026-08-23  

---

## 1. Purpose & User Story
- **As a** kid or parent looking at the kitchen screen,
- **I want to** read a funny Dad joke and reveal the punchline,
- **So that** we get a laugh before school or dinner!

---

## 2. Visual & Display Design
- **View**: Indigo/Purple gradient card with a playful "Kid Built 🚀" badge.
- **Punchline State**: Hidden initially behind a "Tap for Punchline!" button, revealed in gold text with a bounce animation.
- **Accent Color**: `Purple / Indigo`.

---

## 3. Data Contract & Schema
```typescript
export interface DadJoke {
  q: string; // Question / Setup
  a: string; // Punchline / Answer
}
```

---

## 4. User Interactions
- **Tap Punchline**: Reveals answer and fires celebratory confetti (`canvas-confetti`).
- **Another Joke Button**: Cycles to next joke in the rotation.

---

## 5. Acceptance Criteria Checklist
- [x] Question displays clearly.
- [x] Punchline is hidden until user clicks button.
- [x] Confetti fires upon punchline reveal.
- [x] "Another Joke" button cycles through jokes list.

