# 👨‍👩‍👧‍👦 Family Contributor Onboarding Guide

Welcome to the **Swentonelli Family Engineering Team**! 🚀  

---

## 🚀 We Have Many Options How to Contribute!

```mermaid
flowchart TD
    Start([How do you want to contribute?]) --> Q1{What are you doing?}

    %% Path 1: Quick requests
    Q1 -->|Quick request for AI| Ex1["📝 <b>Example</b><br><i>'Make the events list their duration'</i>"]
    Ex1 --> Opt1["✨ <b>The Beagle Chat</b><br><b>From:</b> On the Planner Screen"]

    %% Path 2: Big brainstorming
    Q1 -->|Brainstorm big requests!| Ex2["📝 <b>Example</b><br><i>'Design a Who Fed Scout widget'</i>"]
    Ex2 --> Opt2["💬 <b>Gemini in Browser</b><br><b>From:</b> gemini.google.com"]

    %% Path 3: Direct desktop updates
    Q1 -->|Make real updates!| Ex3["📝 <b>Example</b><br><i>'Implement driving directions for my sports'</i>"]
    Ex3 --> Opt3["🤖 <b>Antigravity Desktop App</b><br><b>From:</b> Desktop App (Mac & Windows)"]

    %% Path 4: Full coding & developer
    Q1 -->|Code real updates!| Ex4["📝 <b>Example</b><br><i>'I want to be a nerd'</i>"]
    Ex4 --> Opt4["💻 <b>VS Code + Antigravity</b><br><b>From:</b> Desktop Developer IDE"]

    classDef exBox fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#334155;
    classDef optBox fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#15803d;
    class Ex1,Ex2,Ex3,Ex4 exBox;
    class Opt1,Opt2,Opt3,Opt4 optBox;
```

---

## 🛠️ How to Use

### ✨ The Beagle Chat
1. Click **"✨ Suggest Idea / Request Change"** on the planner screen.
2. Type or voice-record your request (e.g. *"Make the events list their duration"*).
3. The AI attempts to make the change automatically or sends it to Dad for review.

---

### 💬 Gemini in Browser
1. Open **[gemini.google.com](https://gemini.google.com)** in any browser.
2. Ask Gemini to design your feature:
   > *"Design a Who Fed Scout widget for our family dashboard with checkmarks for breakfast, dinner, and walks."*
3. Share the blueprint with Dad and Bennett to build it into the dashboard!

---

### 🤖 Antigravity Desktop App

#### Step 1: Install the App
* **🍎 Mac (because Daddy's got you baby!)**: **[👉 Download Antigravity for Mac (.dmg)](https://antigravity.google/download)** — Drag into `Applications` and open.
* **🪟 Windows**: **[👉 Download Antigravity for Windows (.exe)](https://antigravity.google/download)** — Run the installer and open.

#### Step 2: Open & Chat
1. **Sign In**: Click **Sign in with Google**.
2. **Open Project**: Click **Clone from GitHub / URL** (or **Open Project**) and paste:
   ```
   https://github.com/Swensation/swentonelli
   ```
3. **Chat**: Ask Antigravity for any updates (e.g. *"Implement driving directions for my sports"*).

---

### 💻 VS Code + Antigravity
1. **1-Click Setup**: Run in PowerShell or Command Prompt:
   ```powershell
   irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
   ```
2. **Handoff**: Inside VS Code Antigravity chat, paste:
   > *"Please help Bennett sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via gh auth login, verify my .env.local Gemini credentials, run npm test, and launch the server."*


