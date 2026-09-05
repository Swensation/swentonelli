# 🌟 Swentonelli Family Dashboard

Welcome to the **Swentonelli Family Engineering Dashboard**! 🚀

A modern Next.js + Tailwind CSS unified family timeline, school schedule, custody coordination, sports hub, and kid-designed widgets powered by Google Gemini AI and autonomous agent CI/CD pipelines.

---

## 🧭 Family Contributor Pathways (Choose Your Lane!)

We have tailored setup paths so everyone in the family can contribute comfortably without feeling overwhelmed:

| Family Member | Best Path | Why It's Best |
| :--- | :--- | :--- |
| 🌸 **Mom / Wife (Mac)** | **[Lane 1: Antigravity Standalone](#-lane-1-mom--wife-mac--antigravity-standalone-app)** | Clean, pure chat canvas. **Zero code editor clutter, zero terminal.** |
| 🎈 **Kids (Aria, Brighton, Benjamin)** | **[Lane 2: Pure Web Browser Chat](#-lane-2-the-kids-aria-brighton-benjamin--pure-web-browser-chat)** | **Zero downloads or installs.** Works on Chromebook, iPad, Mac, or PC. |
| 💻 **Bennett & Dad (Windows PC)** | **[Lane 3: VS Code + Antigravity](#-lane-3-bennett--dad-windows-pc--vs-code--antigravity)** | Full developer toolchain with live code editor, automated tests, and terminal. |

---

## 🌸 Lane 1: Mom / Wife (Mac — Antigravity Standalone App)

> **No code editor, no debugger windows, and no terminal required.** Just an AI chat window where you can request features, calendar adjustments, or dashboard changes in plain English.

### Step 1: Install Antigravity Standalone on Mac
1. Download **Antigravity Standalone for Mac** (Apple Silicon or Intel).
2. Drag **Antigravity** into your `Applications` folder and open it.
3. In Antigravity, click **Open Project** (or **Clone Repository**) and select `Swensation/swentonelli`.

### Step 2: Chat with Antigravity!
Simply type what you want changed:
> *"Please show sports practices earlier on the timeline, add a reminder badge for school picture day on Tuesday, and make sure the therapy appointments are colored in purple."*

---

## 🎈 Lane 2: The Kids (Aria, Brighton, Benjamin — Pure Web Browser Chat)

> **No downloads, no installations!** Works right inside Chrome, Safari, or an iPad browser.

### Step 1: Open the Web Chat
1. Open your browser on any tablet, laptop, or phone.
2. Go to the family project web interface:
   👉 **[Swentonelli Cloud Agent Web Chat](https://github.com/codespaces/new?repo=Swensation/swentonelli)**
3. Sign in with your Google or GitHub account.

### Step 2: Use the Kids Prompting Guide
Kids can build widgets and customize the family screen by talking to the agent:
- *"Change my avatar to my favorite character!"*
- *"Build a Pet Care Widget so we can check off when Scout gets fed and walked."*
- *"Add a countdown widget to our summer vacation!"*

📘 *See the full [Kids Prompting Guide](docs/KIDS_PROMPTING_GUIDE.md) for fun idea starters!*

---

## 💻 Lane 3: Bennett & Dad (Windows PC — VS Code + Antigravity)

> **Full developer setup with Git, Node.js, automated test suites, and VS Code.**

### Option A: 1-Click Install via PowerShell
Open **PowerShell** (<kbd>Win</kbd> + <kbd>X</kbd> ➔ **Terminal** or **PowerShell**) and paste:
```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

### Option B: 1-Click Install via Command Prompt (`cmd.exe`)
If PowerShell is not pinned, open **Command Prompt** and paste:
```cmd
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex"
```

### Option C: Manual Install
```cmd
winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli Microsoft.VisualStudioCode Python.Python.3.12
mkdir %USERPROFILE%\personal
cd %USERPROFILE%\personal
git clone https://github.com/Swensation/swentonelli.git
cd swentonelli
npm install
code .
```

---

## 🤖 The 1-Prompt Hand-Off for Bennett

Once VS Code opens on Bennett's machine, open the **Antigravity** chat panel and paste:

> *"Please help Bennett (my son) sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via `gh auth login`, verify my `.env.local` Gemini credentials, run `npm test`, and launch the local server."*

---

## 👨‍💻 Dad's Admin Checklist

1. **GitHub Collaborators**: When family members get their GitHub account, add them with Write access at [Swensation/swentonelli Settings ➔ Collaborators](https://github.com/Swensation/swentonelli/settings/access).
2. **Gemini API Key**: Add the family Gemini key to their local `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 🧪 Development & Verification Commands

- **Run Automated Test Suite (156+ checks)**:
  ```bash
  npm test
  ```
- **Start Local Web Server**:
  ```bash
  npm run dev
  ```
  *(Opens on [http://localhost:3000](http://localhost:3000)).*

---

## 📚 Family Documentation & Guides
- [Kids Prompting & Feature Guide](docs/KIDS_PROMPTING_GUIDE.md)
- [Architecture & Invariants](docs/ARCHITECTURE.md)
- [Contributor Onboarding Guide](docs/ONBOARDING.md)
- [Family Enhancements Backlog](docs/parent-info/family-enhancements-backlog.md)
