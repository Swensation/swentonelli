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
      issue.title.startsWith("[Website Feedback]") ||
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

// 4. Dispatch Autonomous Coder Execution Workflow
async function dispatchExecuteWorkflow(prNumber: number) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/execute-beagle-proposal.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Beagle-Triage-Engine",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: { pr_number: prNumber.toString() },
        }),
      }
    );

    if (res.ok || res.status === 204) {
      console.log(`🚀 [0-Touch Dispatch] Triggered execute-beagle-proposal.yml for PR #${prNumber}!`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`Could not dispatch execute workflow for PR #${prNumber}:`, errText);
      return false;
    }
  } catch (err: any) {
    console.warn(`Error dispatching execute workflow:`, err.message);
    return false;
  }
}

// 5. Update GitHub labels
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

async function closeAsNoise(issueNumber: number) {
  try {
    // 1. Add status:noise label
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Triage-Engine",
      },
      body: JSON.stringify({ labels: ["status:noise"] }),
    });

    // 2. Close issue as not planned
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Triage-Engine",
      },
      body: JSON.stringify({ state: "closed", state_reason: "not_planned" }),
    });
    console.log(`🧹 Successfully closed noise issue #${issueNumber}.`);
  } catch (err: any) {
    console.warn(`Could not close issue #${issueNumber} as noise:`, err.message);
  }
}

interface OpenProposalPR {
  number: number;
  head: string;
  title: string;
  body: string;
  hasCodeCommits: boolean;
}

async function findExistingOpenProposalPR(): Promise<OpenProposalPR | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&base=main`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Triage-Engine",
        },
      }
    );
    if (!res.ok) return null;
    const prs = await res.json();
    const openProposal = prs.find(
      (p: any) =>
        p.title.startsWith("[Functional Pull Request]") ||
        p.head.ref.startsWith("proposal/functional-pr-") ||
        p.head.ref.startsWith("proposal/beagle-triage-")
    );
    if (!openProposal) return null;

    // Check if PR already has implementation code commits
    const commitsRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${openProposal.number}/commits`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Triage-Engine",
        },
      }
    );
    let hasCodeCommits = false;
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      hasCodeCommits = commits.some((c: any) =>
        (c.commit.message || "").startsWith("feat: add implementation") ||
        (c.commit.message || "").startsWith("feat: autonomous execution")
      );
    }

    return {
      number: openProposal.number,
      head: openProposal.head.ref,
      title: openProposal.title,
      body: openProposal.body || "",
      hasCodeCommits,
    };
  } catch (err: any) {
    console.warn("Could not inspect open PRs:", err.message);
    return null;
  }
}

function cleanProposalOutput(rawMarkdown: string): string {
  return rawMarkdown
    .replace(/^#+\s*(?:Beagle\s+Batch\s+Triage\s+Report|Beagle\s+Triage\s+Report\s*&?\s*Implementation\s+Proposal|Functional\s+Pull\s+Request\s+Proposal).*$/gim, "")
    .replace(/^[*-]?\s*\*\*Date:\*\*.*$/gim, "")
    .replace(/^[*-]?\s*Date:\s+.*$/gim, "")
    .replace(/^[*-]?\s*\*\*Reporter:\*\*.*$/gim, "")
    .replace(/^[*-]?\s*Reporter:\s+.*$/gim, "")
    .replace(/^[*-]?\s*\*\*Dashboard:\*\*.*$/gim, "")
    .replace(/^[*-]?\s*Dashboard:\s+.*$/gim, "")
    .replace(/^NOISE_ISSUES:\s*\[.*?\]$/gim, "")
    .trim();
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
4. **Resource Verification Requirement**: For any request to connect to an external resource (e.g. calendar ICS feed, school lunch URL, API endpoint), explicitly state the exact direct feed URL (e.g. direct TeamSnap, SportsEngine, or private iCal token) and state that it must be validated for HTTP 200 reachability before merge.
5. **Risk Assessment**: Classify the overall proposal batch into one of two risk tiers:
   - If all action items are straightforward and non-breaking (e.g. adding or subscribing to a calendar, styling, colors, labels, text/copy, child icons, isolated helper logic), classify as LOW risk.
   - If any action item involves authentication, database schema, major architectural redesign, or is ambiguous, classify as HIGH risk.
   Include a line formatted as: RISK_TIER: [LOW|HIGH] - <one-line rationale>
6. **Audio Tests & Noise**: If any issue is an audio test (e.g. "test 1 2 3", "testing mic") or contains unintelligible gibberish, explicitly include a line at the very end of your response formatted as: NOISE_ISSUES: [#num1, #num2]
7. **No Metadata Headers**: DO NOT output metadata lines such as 'Date:', 'Reporter:', or 'Dashboard:'. Start directly with the proposals.
8. Format the output in clean, readable Markdown with GitHub callouts.`;

  console.log("\n🧠 Synthesizing feedback with Google Gemini...");
  const proposalMarkdown = await callGeminiTriage(prompt);

  console.log("\n==================================================================");
  console.log("📋 PROPOSED IMPLEMENTATION PLAN & SYNTHESIS");
  console.log(proposalMarkdown);
  console.log("\n==================================================================");

  // Auto-close noise issues if detected
  const noiseMatch = proposalMarkdown.match(/NOISE_ISSUES:\s*\[(.*?)\]/i);
  if (noiseMatch && noiseMatch[1]) {
    const noiseNums = noiseMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim().replace("#", ""), 10))
      .filter((n) => !isNaN(n));
    for (const n of noiseNums) {
      console.log(`🧹 Auto-closing noise/audio test issue #${n}...`);
      await closeAsNoise(n);
    }
  }

  // Write to GitHub Step Summary if running in GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n# 📋 Functional PR Triage Report\n\n${proposalMarkdown}\n`);
    } catch {
      // ignore
    }
  }

  // If in PR mode, create branch or update existing rolling PR
  if (CREATE_PR) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const existingPR = await findExistingOpenProposalPR();

    // CASE 1: Open PR already exists with code commits in progress
    if (existingPR && existingPR.hasCodeCommits) {
      console.log(
        `⏳ Open PR #${existingPR.number} already has implementation commits in progress. Leaving new feedback in inbox for the next batch.`
      );
      return;
    }

    // CASE 2: Open PR exists in proposal/review phase (The Rolling PR!)
    if (existingPR && !existingPR.hasCodeCommits) {
      console.log(
        `🔄 Found existing open proposal PR #${existingPR.number} on branch '${existingPR.head}'. Bundling new issues into rolling proposal...`
      );
      try {
        execSync(`git fetch origin ${existingPR.head}`, { stdio: "inherit" });
        execSync(`git checkout ${existingPR.head}`, { stdio: "inherit" });
        execSync(`git pull origin ${existingPR.head}`, { stdio: "inherit" });

        // Extract previously linked issue numbers
        const prevMatches = Array.from(existingPR.body.matchAll(/Closes #(\d+)/g)).map((m) => parseInt(m[1], 10));
        const allIssueNumbers = Array.from(new Set([...prevMatches, ...pendingIssues.map((i) => i.number)])).sort((a, b) => a - b);

        const cleanContent = cleanProposalOutput(proposalMarkdown);
        const proposalDir = path.join(process.cwd(), "specs", "proposals");
        if (!fs.existsSync(proposalDir)) fs.mkdirSync(proposalDir, { recursive: true });
        const proposalFile = path.join(proposalDir, `triage-${timestamp}.md`);

        const fullDoc = `# Beagle Triage Report & Implementation Proposal

- [ ] **Ready to execute**: Check this box to start autonomous implementation

> Triaged from Issues: ${allIssueNumbers.map((n) => `#${n}`).join(", ")}

${cleanContent}
`;
        fs.writeFileSync(proposalFile, fullDoc, "utf-8");

        execSync("git add specs/proposals/", { stdio: "inherit" });
        execSync(`git commit -m "docs: update functional pull request proposal for issues ${allIssueNumbers.map((n) => '#' + n).join(', ')}"`, {
          stdio: "inherit",
        });
        execSync(`git push origin ${existingPR.head}`, { stdio: "inherit" });

        // Update Pull Request via GitHub API
        console.log(`📬 Updating GitHub Pull Request #${existingPR.number}...`);
        const prBody = `## Beagle Triage Report & Implementation Proposal

- [ ] **Ready to execute**: Check this box to start autonomous implementation

**Linked Issues**: ${allIssueNumbers.map((n) => `Closes #${n}`).join(", ")}

---

${cleanContent}`;

        const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${existingPR.number}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "Triage-Engine",
          },
          body: JSON.stringify({
            title: `[Functional Pull Request] Triaged Website Feedback (Issues ${allIssueNumbers.map((n) => `#${n}`).join(", ")})`,
            body: prBody,
          }),
        });

        if (updateRes.ok) {
          console.log(`✅ Pull Request #${existingPR.number} updated successfully!`);

          // Post rolling update comment on PR
          await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${existingPR.number}/comments`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "Triage-Engine",
            },
            body: JSON.stringify({
              body: `🔄 **Rolling PR Update**: Bundled new website feedback into this proposal: ${pendingIssues
                .map((i) => `#${i.number}`)
                .join(", ")}. The proposal and issue links above have been updated!`,
            }),
          });

          // Mark newly added issues as status:triaged
          for (const issue of pendingIssues) {
            await updateIssueLabels(issue.number, ["status:triaged"], ["status:pending-triage"]);
          }
          console.log("🏷️ Updated newly bundled issue labels to 'status:triaged'.");
        } else {
          const errText = await updateRes.text();
          throw new Error(`Failed to update existing PR: ${errText}`);
        }
      } catch (err: any) {
        console.error("Error during rolling PR update:", err.message);
        throw err;
      } finally {
        try {
          execSync("git checkout main", { stdio: "inherit" });
        } catch {
          // ignore
        }
      }
      return;
    }

    // Determine Risk Tier from proposal
    const isLowRiskProposal = /RISK_TIER:\s*LOW/i.test(proposalMarkdown) ||
      (!/RISK_TIER:\s*HIGH/i.test(proposalMarkdown) && !/auth|database|security|breaking/i.test(proposalMarkdown));
    const riskLabel = isLowRiskProposal ? "risk:low" : "risk:high";
    console.log(`🛡️ Evaluated Proposal Risk Tier: ${isLowRiskProposal ? "LOW (0-Touch Auto-Approved)" : "HIGH (Needs Human Review)"}`);

    // CASE 3: No open PR exists -> Create a brand new branch and PR
    const branchName = `proposal/functional-pr-${timestamp}`;
    console.log(`\n🚀 Creating new proposal branch: ${branchName}...`);

    try {
      execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });

      const cleanContent = cleanProposalOutput(proposalMarkdown);
      const proposalDir = path.join(process.cwd(), "specs", "proposals");
      if (!fs.existsSync(proposalDir)) fs.mkdirSync(proposalDir, { recursive: true });
      const proposalFile = path.join(proposalDir, `triage-${timestamp}.md`);

      const checkboxLine = isLowRiskProposal
        ? "- [x] **Ready to execute**: Auto-approved for 0-touch execution (Low Risk)"
        : "- [ ] **Ready to execute**: Complex / High-risk request. Human review required.";

      const fullDoc = `# Beagle Triage Report & Implementation Proposal

${checkboxLine}

> Triaged from Issues: ${pendingIssues.map((i) => `#${i.number}`).join(", ")}

${cleanContent}
`;
      fs.writeFileSync(proposalFile, fullDoc, "utf-8");

      execSync("git add specs/proposals/", { stdio: "inherit" });
      execSync(`git commit -m "docs: functional pull request proposal for ${pendingIssues.length} items"`, {
        stdio: "inherit",
      });
      execSync(`git push origin ${branchName}`, { stdio: "inherit" });

      // Open Pull Request via GitHub API
      console.log("📬 Opening GitHub Pull Request...");
      const prBody = `## Beagle Triage Report & Implementation Proposal

${checkboxLine}

**Linked Issues**: ${pendingIssues.map((i) => `Closes #${i.number}`).join(", ")}

---

${cleanContent}`;

      const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Triage-Engine",
        },
        body: JSON.stringify({
          title: `[Functional Pull Request] Triaged Website Feedback (Issues ${pendingIssues.map((i) => `#${i.number}`).join(", ")})`,
          head: branchName,
          base: "main",
          body: prBody,
        }),
      });

      if (prRes.ok) {
        const prJson = await prRes.json();
        console.log(`✅ Pull Request Created: ${prJson.html_url}`);

        // Add labels to PR
        const prLabels = [riskLabel];
        if (!isLowRiskProposal) prLabels.push("needs-human-review");
        await updateIssueLabels(prJson.number, prLabels, []);

        // Update issue labels to status:triaged and risk label
        for (const issue of pendingIssues) {
          const issueLabels = ["status:triaged", riskLabel];
          if (!isLowRiskProposal) issueLabels.push("needs-human-review");
          await updateIssueLabels(issue.number, issueLabels, ["status:pending-triage"]);
        }
        console.log("🏷️ Updated issue and PR labels.");

        // For LOW RISK: Immediately trigger 0-touch execution in GitHub Actions
        if (isLowRiskProposal) {
          console.log(`🚀 [0-Touch Automation] Triggering autonomous coder for low-risk PR #${prJson.number}...`);
          await dispatchExecuteWorkflow(prJson.number);
        } else {
          console.log(`⏸️ [Human Gate] PR #${prJson.number} tagged with 'needs-human-review'. Awaiting Andrew's approval.`);
        }
      }
    } catch (err: any) {
      console.error("Error during PR creation flow:", err.message);
      throw err;
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
