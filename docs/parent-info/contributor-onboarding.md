# 👨‍👩‍👧‍👦 Family Contributor Onboarding Guide

Welcome to the **Swentonelli Family Engineering Team**! 🚀  
This guide provides simplified pathways tailored to each family member's comfort level.

---

## 🧭 Choose Your Setup Pathway

| Family Member | Target Setup | Experience |
| :--- | :--- | :--- |
| 🌸 **Mom / Wife (Mac)** | **Antigravity Standalone Desktop App** | Clean chat interface. **No VS Code, no terminal.** |
| 🎈 **Kids (Aria, Brighton, Benjamin)** | **Pure Web Browser Chat** | **Zero install.** Instant chat in Safari / Chrome on iPad or laptop. |
| 💻 **Bennett & Dad (Windows PC)** | **VS Code + Antigravity IDE** | Full developer setup with tests, Git branches, and editor. |

---

## 🌸 Lane 1: Mom / Wife (Mac — Antigravity Standalone App)

1. **Install Antigravity Standalone for Mac**:
   - Download the `.dmg` installer for macOS.
   - Drag **Antigravity** into `Applications` and launch it.
2. **Open the Swentonelli Repository**:
   - In Antigravity, click **Open Project** and select `Swensation/swentonelli`.
3. **Start Chatting**:
   - Talk to Antigravity just like a smart assistant to request schedule tweaks, new calendar reminders, or layout adjustments.

---

## 🎈 Lane 2: The Kids (Aria, Brighton, Benjamin — Pure Web Browser Chat)

1. **Open the Web Chat Link**:
   - Go to the family project in your web browser: [Swentonelli Web Chat](https://github.com/codespaces/new?repo=Swensation/swentonelli).
2. **Sign In**:
   - Sign in with your family Google / GitHub account.
3. **Design Widgets & Features**:
   - Talk to the agent to change your avatar, customize school lunch favorites, or build new widgets.
   - See [docs/KIDS_PROMPTING_GUIDE.md](file:///c:/Users/aswenson/personal/swentonelli/docs/KIDS_PROMPTING_GUIDE.md) for ideas!

---

## 💻 Lane 3: Bennett & Dad (Windows PC — VS Code + Antigravity)

### Step 1: 1-Click Bootstrapper
Open **PowerShell** or **Command Prompt** on the PC and run:
```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

### Step 2: Handoff to Antigravity
Inside VS Code, paste this prompt in the Antigravity chat:
> **"Please help Bennett (my son) sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via gh auth login, verify my .env.local Gemini credentials, run npm test, and launch the local server."**

---

## 🛠️ What the Agent Automates Next

### 1. Git Identity & GitHub Authentication
- Configures local Git identity:
  ```powershell
  git config --global user.name "Bennett Swenson"
  git config --global user.email "<bennett-email>@gmail.com"
  ```
- Prompts for GitHub authentication via GitHub CLI:
  ```powershell
  gh auth login --web
  ```
- Checks collaborator access on `Swensation/swentonelli`.

### 2. Environment & Google Gemini API Setup
- Creates `.env.local` and loads `GEMINI_API_KEY`.

### 3. Local Verification & First Test
- Runs `npm test` (verifies all 156+ test checks pass).
- Launches `npm run dev` to preview the dashboard on `http://localhost:3000`.

---

## 🏆 Definition of "Ready to Contribute at Dad's Level"
1. `npm test` passes cleanly.
2. Contributor can create feature branches: `git checkout -b feature/bennett-first-widget`.
3. Contributor can prompt Antigravity to build widgets using [docs/KIDS_PROMPTING_GUIDE.md](file:///c:/Users/aswenson/personal/swentonelli/docs/KIDS_PROMPTING_GUIDE.md).
4. Contributor can push branches to GitHub and watch the autonomous CI pipeline run!
