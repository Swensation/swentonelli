# Spec: Talk to the Beagle (Voice & Text Feedback Pipeline)

## 1. Overview & Objective
"Talk to the Beagle" is an intuitive, frictionless voice and text feedback channel on the Scouty Planner dashboard. It allows any family member at the kiosk monitor or on mobile to dictate or type bugs, schedule changes, or desired adjustments. 

Feedback accumulates in a GitHub issue inbox (`feedback-inbox`), which is then batch-triaged magnetically using Google Gemini into an implementation plan and proposal for human review before execution and deployment.

---

## 2. Frontend UI Specifications

### 2.1. Floating Action Button
- **Placement**: Fixed at the bottom-right corner (`fixed bottom-6 right-6 z-50`).
- **Styling**: Pill-shaped action button with dark backdrop (`bg-slate-900/90`), amber border (`border-amber-500/50`), and subtle warm glow.
- **Avatar**: Circular Scout beagle avatar (`/scout.png`).
- **Label**: **"Talk to the Beagle"** with subtle mic icon.
- **Access Gating**: Available to all users (kiosk & mobile) without authentication barriers.

### 2.2. Modal Window ("Talk to the Beagle")
- **Header**: Scout mascot icon, title "Talk to the Beagle", and subtitle "Dictate or type any update, bug, or request for Scouty Planner".
- **Clean UI**: No distracting autodeploy badges or technical telemetry clutter displayed in the main viewport.
- **Dictation Input (Textarea)**:
  - **Placeholder**:
    ```text
    Dictate directly what changes you want to be made. Be explicit as possible. Don't try to fix it, just point out what is wrong or what you want to see changed.

    Ex: Benjamin's appointment on the 23rd for the Dentist is not appearing

    Ex: I want Brighton's icon to be a picture of a Tuba
    ```
  - **Character Counter**: Subtle indicator showing character length.
  - **Microphone Action Button**: Positioned inside/adjacent to the textarea.
    - Uses native browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
    - Clicking toggles listening mode.
    - While listening: pulses with animated red ring and displays "Listening... (speak clearly)".
    - Real-time speech transcription appends directly to textarea content.
- **Submit Action**:
  - Button text: **"Upload to the Beagle"**.
  - Animated spinner while sending.
  - Dispatches POST request to `/api/agent-feedback`.
- **Success State**:
  - Confirms receipt ("Uploaded to the Beagle!").
  - Displays direct link to the created GitHub issue.

---

## 3. Serverless Ingestion Contract (`POST /api/agent-feedback`)
- **Endpoint**: `/api/agent-feedback`
- **Method**: POST
- **Payload**:
  ```json
  {
    "dictatedText": "I want Brighton's icon to be a picture of a Tuba",
    "telemetry": {
      "routeUrl": "http://localhost:3000/",
      "viewport": { "width": 1920, "height": 1080 },
      "timestamp": "2026-08-28T20:45:00.000Z",
      "userAgent": "Mozilla/5.0..."
    }
  }
  ```
- **Issue Tagging Contract**:
  - `feedback-inbox` (Purple: `#8b5cf6`)
  - `status:pending-triage` (Amber: `#f59e0b`)
- **Issue Title**: `[Beagle Feedback] <summary snippet>`
- **Issue Body Structure**:
  - `# User Request`: Clean dictated user text.
  - `# Context`: Telemetry context (route, viewport, timestamp, user agent).

---

## 4. Batch Triage & Proposal Architecture
Incoming feedback does not trigger immediate commits or blind deployments. Instead, items accumulate in the GitHub issue inbox until batch triaged.

### 4.1. Local Interactive Triage (VS Code / Antigravity)
- Command: `npm run triage:feedback`
- Connects to GitHub API, reads all open `feedback-inbox` + `status:pending-triage` issues.
- Synthesizes items, detects duplicates, filters test noise.
- Provides structured implementation plan proposal for live review in Antigravity chat.

### 4.2. Cloud Batch Triage (GitHub Actions)
- Workflow: `.github/workflows/batch-triage-feedback.yml`
- Triggers on manual dispatch ("Run workflow: Triage Feedback") or `/triage` comment.
- Runs Gemini agent to generate consolidated proposal, creates a branch, opens a Pull Request with linked issues, and marks issues as `status:triaged`.
- Human reviews the PR on mobile or web and clicks "Merge" to trigger Firebase App Hosting deployment.
