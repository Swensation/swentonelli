# 👨‍👦 Family Contributor Onboarding Guide (Bennett & Future Kids)

Welcome to the **Swentonelli Family Engineering Team**! 🚀  
This guide lets Dad set up your PC with a single PowerShell line, and then hands off to **Antigravity** to automate your GitHub credentials, environment keys, and permissions with one prompt.

---

## ⚡ Step 1: The 1-Click PC Bootstrapper (Run Once in PowerShell)

On your PC, open **PowerShell** (press `Win + X` and select **Terminal** or **PowerShell**) and paste this single command:

```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

### What this automatically does:
1. Installs **Git for Windows**, **Node.js (LTS)**, **GitHub CLI (`gh`)**, **Python 3.12**, and **Visual Studio Code** via Windows Package Manager (`winget`).
2. Clones the project into `C:\Users\<username>\personal\swentonelli`.
3. Runs `npm install` to download all project libraries and engines.
4. Opens **Visual Studio Code** directly into the project.

---

## 🤖 Step 2: The 1-Prompt Hand-Off to Antigravity

In VS Code, open the **Antigravity** chat assistant and copy-paste this prompt:

> **"Please get Bennett (my son) able to contribute at the same level that Dad is. Configure my git identity, verify my GitHub and Gemini credentials, test my local server, and guide me through any remaining human input."**

---

## 🛠️ What the Agent Automates Next

When the agent receives that prompt, it runs through the automated checklist below:

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
  *(Opens browser where you log into your personal GitHub account and approve with 1 click).*
- Checks access to `Swensation/swentonelli` (or asks Dad to add your GitHub username as an Outside Collaborator with Write access).

### 2. Environment & Google Gemini API Setup
- Checks `.env.local`:
  - Copies `.env.example` (or creates `.env.local`).
  - Connects to your family Google account's Gemini API key (from Google AI Studio or Google One Pro benefit).
  - Guides you to enter the key safely.

### 3. Local Verification & First Test
- Runs `npm test` to verify all 156 test checks pass on your machine.
- Launches `npm run dev` to verify `http://localhost:3000` loads the 4-column family dashboard with your Moe's Tavern avatar!

---

## 🏆 Definition of "Ready to Contribute at Dad's Level"
You are fully configured when:
1. `npm test` passes cleanly (156/156 checks green).
2. You can create a branch: `git checkout -b feature/bennett-first-widget`.
3. You can ask Antigravity to build widgets using [docs/KIDS_PROMPTING_GUIDE.md](file:///c:/Users/aswenson/personal/swentonelli/docs/KIDS_PROMPTING_GUIDE.md).
4. You can push your branch to GitHub and watch the autonomous CI pipeline run!
