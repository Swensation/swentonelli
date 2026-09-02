# 👨‍👦 Family Contributor Onboarding Guide (Bennett & Future Kids)

Welcome to the **Swentonelli Family Engineering Team**! 🚀  
This guide lets Dad set up your PC with a single PowerShell line, and then hands off to **Antigravity** to automate your GitHub credentials, environment keys, and permissions with one prompt.

---

## ⚡ Step 1: Contributor Bootstrapper (Choose Your System)

### Option A: Windows (PowerShell)
On your PC, open **PowerShell** (press `Win + X` and select **Terminal** or **PowerShell**) and paste:
```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

### Option B: Windows (Command Prompt / `cmd.exe` — No PowerShell shortcut)
If you don't have a PowerShell shortcut or are in standard Command Prompt:
```cmd
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex"
```
*Or install directly via `winget` in Command Prompt:*
```cmd
winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli Microsoft.VisualStudioCode Python.Python.3.12
```

### Option C: macOS / Linux (Terminal)
Open Terminal and run:
```bash
curl -fsSL https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.sh | bash
```

### What this automatically does:
1. Installs **Git**, **Node.js (LTS)**, **GitHub CLI (`gh`)**, and **Visual Studio Code**.
2. Clones the project into your personal workspace (`personal/swentonelli`).
3. Runs `npm install` to download all project libraries and engines.
4. Opens **Visual Studio Code** directly into the project.

---

## 🤖 Step 2: The 1-Prompt Hand-Off to Antigravity

In VS Code, open the **Antigravity** chat assistant and copy-paste this prompt:

> **"Please help Bennett (my son) sign up for GitHub and get able to contribute at the same level that Dad is. Help me create my GitHub account and git identity, connect my Gemini credentials, test my local server, and guide me through any remaining steps."**

---

## 🛠️ What the Agent Automates Next

When the agent receives that prompt, it runs through the automated checklist below:

### 1. GitHub Account Sign-Up & Authentication
- If you don't have a GitHub account yet:
  - Directs you to [github.com/signup](https://github.com/signup) to create your free GitHub account using your family Google/Gmail address.
- Configures your local Git identity:
  ```powershell
  git config --global user.name "Bennett Swenson"
  git config --global user.email "<your-email>@gmail.com"
  ```
- Authenticates with GitHub CLI:
  ```powershell
  gh auth login --web
  ```
  *(Opens your browser to link your new GitHub account with 1 click).*
- Prompts Dad to add your new GitHub username as an Outside Collaborator on `Swensation/swentonelli` with Write access.

### 2. Environment & Google Gemini API Setup
- Checks `.env.local`:
  - Copies `.env.example` (or creates `.env.local`).
  - Connects to your family Google account's Gemini API key (from Google AI Studio or Google One Pro benefit).
  - Guides you to enter the key safely.

### 3. Local Verification & First Test
- Runs `npm test` to verify all tests pass cleanly on your machine.
- Launches `npm run dev` to verify `http://localhost:3000` loads the 4-column family dashboard with your Moe's Tavern avatar!


---

## 🏆 Definition of "Ready to Contribute at Dad's Level"
You are fully configured when:
1. `npm test` passes cleanly (156/156 checks green).
2. You can create a branch: `git checkout -b feature/bennett-first-widget`.
3. You can ask Antigravity to build widgets using [docs/KIDS_PROMPTING_GUIDE.md](file:///c:/Users/aswenson/personal/swentonelli/docs/KIDS_PROMPTING_GUIDE.md).
4. You can push your branch to GitHub and watch the autonomous CI pipeline run!
