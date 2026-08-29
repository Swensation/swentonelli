/**
 * Beagle Feedback Batch Triage Engine
 *
 * Aggregates all open feedback issues from GitHub (labeled 'feedback-inbox' or 'status:pending-triage'),
 * synthesizes them using Google Gemini (3.7 Flash with fallback), filters noise,
 * and generates a consolidated Implementation Proposal.
 *
 * Modes:
 *   - Local interactive: tsx scripts/triage-feedback.ts
 *   - GitHub PR creation: tsx scripts/triage-feedback.ts --create-pr
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 1. Load environment variables
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvLocal();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GH_PAT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "Swensation";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "swentonelli";

const CREATE_PR = process.argv.includes("--create-pr");

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN is not configured.");
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not configured.");
  process.exit(1);
}

interface IssueItem {
  number: number;
  title: string;
  body: string;
  html_url: string;
  labels: { name: string }[];
  created_at: string;
}

// 2. Fetch pending feedback issues
async function fetchPendingFeedback(): Promise<IssueItem[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&per_page=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Beagle-Triage-Engine",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}): ${await res.text()}`);
  }

  const issues: IssueItem[] = await res.json();

  // Filter for issues that belong to the feedback inbox or pending triage
  return issues.filter((issue) => {
    const labelNames = (issue.labels || []).map((l) => l.name);
    return (
      labelNames.includes("feedback-inbox") ||
      labelNames.includes("status:pending-triage") ||
      labelNames.includes("auto-agent-trigger") ||
      issue.title.startsWith("[Beagle Feedback]") ||
      issue.title.startsWith("[Agent Feedback]")
    );
  });
}

// 3. Call Gemini with retry and fallback
async function callGeminiTriage(promptText: string): Promise<string> {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite-preview", "gemini-3.7-flash"];

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            systemInstruction: {
              parts: [
                {
                  text: `You are the Beagle Triage Agent for the Scouty Planner dashboard.
Your job is to review raw dictated voice/text feedback issues from family members, cluster them, filter noise/accidental tests, and synthesize a clean, actionable Implementation Proposal.`,
                },
              ],
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) return candidate;
        }

        const errText = await res.text();
        console.warn(`⚠️ Model ${model} returned HTTP ${res.status} (attempt ${attempt}/3): ${errText.slice(0, 100)}...`);
        if (res.status === 503 || res.status === 429) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        break;
      } catch (err: any) {
        console.warn(`Network error on ${model} (attempt ${attempt}/3):`, err.message);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  throw new Error("All Gemini models exhausted for triage synthesis.");
}

// 4. Update GitHub labels
async function updateIssueLabels(issueNumber: number, addLabels: string[], removeLabels: string[]) {
  // Add labels
  if (addLabels.length > 0) {
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Beagle-Triage-Engine",
      },
      body: JSON.stringify({ labels: addLabels }),
    });
  }

  // Remove labels
  for (const label of removeLabels) {
    try {
      await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Beagle-Triage-Engine",
          },
        }
      );
    } catch {
      // ignore
    }
  }
}

async function main() {
  console.log("==================================================================");
  console.log("🐕 Talk to the Beagle: Batch Feedback Triage Engine");
  console.log("==================================================================");

  const pendingIssues = await fetchPendingFeedback();

  if (pendingIssues.length === 0) {
    console.log("🎉 No pending feedback in the Beagle inbox! Everything is clean & up to date.");
    return;
  }

  console.log(`📥 Found ${pendingIssues.length} pending feedback item(s):\n`);
  for (const issue of pendingIssues) {
    console.log(`  • Issue #${issue.number}: ${issue.title}`);
  }

  const prompt = `Please analyze the following raw feedback issues submitted to the Scouty Planner dashboard:

${pendingIssues
  .map(
    (i) => `---
Issue #${i.number}: ${i.title}
Created: ${i.created_at}
Content:
${i.body}
---`
  )
  .join("\n\n")}

Scouty Planner Context:
- Family members: Andrew (Dad / Swen in Millis), Liz (Mom in Holliston), Chris (Dad in Franklin), Callie (Mom in Millis).
- 4 Children: Aria (7th Grade, Millis Middle, Soccer), Brighton (6th Grade, Adams Middle, Field Hockey), Benjamin (5th Grade, CFB Millis), Bennett (4th Grade, Miller Holliston, Football).

Instructions:
1. **Deduplication & Noise Filter**: Identify test requests (e.g. "test test 1 2") or duplicate requests and flag them clearly.
2. **Clustered Proposals**: Group valid requests into categories:
   - Calendar & Activities
   - School Lunch & Schedules
   - Child Avatars & Icons
   - UI & Dashboard Display
   - System & Housekeeping
3. **Proposed Action Items**: For each actionable group, write the exact technical changes required, which files to inspect/modify, and verification steps.
4. Format the output in clean, readable Markdown with GitHub callouts.`;

  console.log("\n🧠 Synthesizing feedback with Google Gemini...");
  const proposalMarkdown = await callGeminiTriage(prompt);

  console.log("\n==================================================================");
  console.log("📋 PROPOSED IMPLEMENTATION PLAN & SYNTHESIS");
  console.log(proposalMarkdown);
  console.log("\n==================================================================");

  // Write to GitHub Step Summary if running in GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n# 🐕 Beagle Batch Triage Report\n\n${proposalMarkdown}\n`);
    } catch {
      // ignore
    }
  }

  // If in PR mode, create branch, write proposal, open PR
  if (CREATE_PR) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const branchName = `proposal/beagle-triage-${timestamp}`;
    console.log(`\n🚀 Creating proposal branch: ${branchName}...`);

    try {
      execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });

      const proposalDir = path.join(process.cwd(), "specs", "proposals");
      if (!fs.existsSync(proposalDir)) fs.mkdirSync(proposalDir, { recursive: true });
      const proposalFile = path.join(proposalDir, `triage-${timestamp}.md`);

      const fullDoc = `# Beagle Batch Feedback Proposal (${new Date().toLocaleDateString()})

> Triaged from Issues: ${pendingIssues.map((i) => `#${i.number}`).join(", ")}

${proposalMarkdown}
`;
      fs.writeFileSync(proposalFile, fullDoc, "utf-8");

      execSync("git add specs/proposals/", { stdio: "inherit" });
      execSync(`git commit -m "docs: beagle feedback batch proposal for ${pendingIssues.length} items"`, {
        stdio: "inherit",
      });
      execSync(`git push origin ${branchName}`, { stdio: "inherit" });

      // Open Pull Request via GitHub API
      console.log("📬 Opening GitHub Pull Request...");
      const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Beagle-Triage-Engine",
        },
        body: JSON.stringify({
          title: `[Beagle Proposal] Triaged Family Feedback (${pendingIssues.length} items)`,
          head: branchName,
          base: "main",
          body: `## 🐶 Talk to the Beagle: Batch Feedback Proposal\n\nTriaged Issues: ${pendingIssues
            .map((i) => `Closes #${i.number}`)
            .join(", ")}\n\n${proposalMarkdown}`,
        }),
      });

      if (prRes.ok) {
        const prJson = await prRes.json();
        console.log(`✅ Pull Request Created: ${prJson.html_url}`);

        // Update issue labels to status:triaged
        for (const issue of pendingIssues) {
          await updateIssueLabels(issue.number, ["status:triaged"], ["status:pending-triage"]);
        }
        console.log("🏷️ Updated issue labels to 'status:triaged'.");
      } else {
        console.error("Failed to create PR:", await prRes.text());
      }
    } catch (err: any) {
      console.error("Error during PR creation flow:", err.message);
    } finally {
      try {
        execSync("git checkout main", { stdio: "inherit" });
      } catch {
        // ignore
      }
    }
  } else {
    console.log("💡 Tip: Review this proposal here in VS Code, or run with '--create-pr' to publish to GitHub.");
  }
}

main().catch((err) => {
  console.error("❌ Triage execution error:", err);
  process.exit(1);
});
