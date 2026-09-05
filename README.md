# 🌟 Swentonelli Family Dashboard

Welcome to the **Swentonelli Family Engineering Dashboard**! 🚀

---

## 👨‍👩‍👧‍👦 Family Pathways (Who Uses What)

| Family Member | Best Match | Level |
| :--- | :--- | :--- |
| 🎈 **Kids (Aria, Brighton, Benjamin)** | **Option 1 (The Beagle Chat)** or **Option 2 (Gemini Chat)** | Simplest |
| 🌸 **Mom / Wife** | **Option 3 (Antigravity Standalone)** | Pure Chat |
| 💻 **Bennett & Dad** | **Option 4 (VS Code + Antigravity)** | Full Developer |

---

## 🚀 We Have Many Options How to Contribute!
*(Ranked from simplest to most complex)*

| Option | From Where | Example Thing You Can Do | Get Started |
| :--- | :--- | :--- | :--- |
| **1. The Beagle Chat** | Directly on the dashboard webpage | *"Vote thumbs-up on Friday tacos"*, *"Scout ate breakfast"* | [Jump to Setup 1](#option-1-the-beagle-chat-on-webpage) |
| **2. Gemini Chat in Browser** | Any web browser (`gemini.google.com`) | *"Design a summer countdown widget with confetti"* | [Jump to Setup 2](#option-2-gemini-chat-in-browser) |
| **3. Antigravity Install** | Desktop app on your PC or Mac | *"Make sports events purple and add a picture day badge"* | [Jump to Setup 3](#option-3-antigravity-standalone-app) |
| **4. VS Code** | Full IDE on computer | Write code, build widgets, run tests, push Git branches | [Jump to Setup 4](#option-4-vs-code--antigravity-full-developer) |

---

## 🛠️ Detailed Setup Guides

### Option 1: The Beagle Chat (On Webpage)
* **From Where**: Right on the live family dashboard (`http://localhost:3000` or deployed web app).
* **Setup**: None!
* **How to Use**:
  1. Click the **"✨ Suggest Idea / Request Change"** button on the dashboard.
  2. Type or speak what you want.
  3. Gemini updates your preferences or logs your request instantly.

---

### Option 2: Gemini Chat in Browser
* **From Where**: Any browser (Chromebook, iPad, laptop) at [gemini.google.com](https://gemini.google.com).
* **Setup**: Just be logged into your family Google account.
* **How to Use**:
  1. Open [gemini.google.com](https://gemini.google.com).
  2. Ask Gemini to design a feature:
     > *"Design a Pet Care Tracker widget for Scout for our family dashboard with checkmarks for breakfast, dinner, and walks."*
  3. Gemini writes the blueprint, and Dad or Bennett runs Antigravity to build it.

---

### Option 3: Antigravity Standalone App

> Clean desktop chat window. **No code editor, no terminal.**

#### 🍎 Mac Instructions (because Daddy's got you baby!)
1. **Download**: **[👉 Download Antigravity for Mac (.dmg)](https://antigravity.google/download)**
2. **Install**: Drag **Antigravity** into your `Applications` folder and open it.
3. **Sign In**: Click **Sign in with Google** (1 click).
4. **Open Repo**: Click **Clone from GitHub / URL**, paste:
   ```
   https://github.com/Swensation/swentonelli
   ```
5. **Chat**: Ask Antigravity for anything you want updated!

#### 🪟 Windows PC Instructions
1. Download & run Antigravity for Windows.
2. Sign in with Google.
3. Click **Open Project** ➔ `Swensation/swentonelli`.

---

### Option 4: VS Code + Antigravity (Full Developer)

> For Bennett & Dad: Full code editor, Git branches, and automated tests.

#### 1-Click Windows Setup (PowerShell or Command Prompt)
Open **PowerShell** or **Command Prompt** and paste:
```powershell
irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
```

#### The 1-Prompt Handoff
Inside VS Code, open the **Antigravity** chat panel and paste:
> *"Please help Bennett sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via `gh auth login`, verify my `.env.local` Gemini credentials, run `npm test`, and launch the local server."*

---

## 👨‍💻 Dad's Checklist

1. **GitHub Invites**: Add family collaborators at [Swensation/swentonelli Settings ➔ Collaborators](https://github.com/Swensation/swentonelli/settings/access).
2. **Gemini Key**: Add `GEMINI_API_KEY` to local `.env.local`.

---

## 🧪 Verification Commands

- **Run Tests**: `npm test` *(156+ automated checks)*
- **Start Local Server**: `npm run dev` *(http://localhost:3000)*

---

## 📚 Family Guides
- [Kids Prompting & Feature Guide](docs/KIDS_PROMPTING_GUIDE.md)
- [Architecture & Invariants](docs/ARCHITECTURE.md)
- [Contributor Onboarding Guide](docs/ONBOARDING.md)
- [Family Enhancements Backlog](docs/parent-info/family-enhancements-backlog.md)
