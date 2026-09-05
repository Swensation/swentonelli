# 🌟 Swentonelli Family Dashboard

Welcome to the **Swentonelli Family Engineering Dashboard**! 🚀

A modern Next.js + Tailwind CSS unified family timeline, school schedule, custody coordination, and sports hub powered by Google Gemini AI and autonomous agent CI/CD pipelines.

---

## ⚡ How to Get Started & Install (Contributor Setup)

Follow the quick-start option below that matches your computer:

### Option A: Windows (PowerShell)
If you have **PowerShell** or **Windows Terminal** (press <kbd>Win</kbd> + <kbd>X</kbd> and select **Terminal** or **PowerShell**):
```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

---

### Option B: Windows (Command Prompt / `cmd.exe` — No PowerShell Shortcut)
If you do not see PowerShell or are using standard Command Prompt (`cmd.exe`):

1. **Launch via PowerShell wrapper**:
   ```cmd
   powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex"
   ```

2. **Or install directly via `winget` in Command Prompt**:
   ```cmd
   winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli Microsoft.VisualStudioCode Python.Python.3.12
   ```
   Then clone the project and open in VS Code:
   ```cmd
   mkdir %USERPROFILE%\personal
   cd %USERPROFILE%\personal
   git clone https://github.com/Swensation/swentonelli.git
   cd swentonelli
   npm install
   code .
   ```

---

### Option C: 1-Click in Browser / Mac / iPad (Zero Install — Perfect for Mom & Non-Technical Users! 🌟)
No terminal or downloads required:
```

---

### Option D: Manual Setup (Any Computer)
1. **Install Prerequisites**:
   - [Git for Windows / Mac](https://git-scm.com/)
   - [Node.js (LTS Version)](https://nodejs.org/)
   - [GitHub CLI (`gh`)](https://cli.github.com/)
   - [Visual Studio Code](https://code.visualstudio.com/)
2. **Clone & Install**:
   ```bash
   git clone https://github.com/Swensation/swentonelli.git
   cd swentonelli
   npm install
   ```
3. **Open in VS Code**:
   ```bash
   code .
   ```

---

## 🤖 Step 2: The 1-Prompt Hand-Off to Antigravity

Once Visual Studio Code opens the project, open the **Antigravity** chat panel and paste this prompt:

> *"Please help Bennett (my son) sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via `gh auth login`, verify my `.env.local` Gemini credentials, run `npm test`, and launch the local server."*

---

## 👨‍💻 Step 3: Dad's Parallel Action Checklist

While the contributor machine is setting up:
1. **GitHub Collaborator Invite**: Once the contributor creates or shares their GitHub username, Dad goes to [Swensation/swentonelli Settings ➔ Collaborators](https://github.com/Swensation/swentonelli/settings/access) and invites them with **Write** access.
2. **Gemini API Key**: Provide the family Google AI Studio API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 🧪 Verification & Development Commands

- **Run Automated Tests**:
  ```bash
  npm test
  ```
  *(Verifies all TypeScript syntax, calendar feeds, child profiles, badges, and business logic).*

- **Start Local Server**:
  ```bash
  npm run dev
  ```
  *(Opens the dashboard on [http://localhost:3000](http://localhost:3000)).*

---

## 📚 Family Documentation & Guides
- [Kids Prompting & Feature Guide](docs/KIDS_PROMPTING_GUIDE.md)
- [Architecture & Invariants](docs/ARCHITECTURE.md)
- [Contributor Onboarding Guide](docs/ONBOARDING.md)
- [Family Enhancements Backlog](docs/parent-info/family-enhancements-backlog.md)

