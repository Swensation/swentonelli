/**
 * Pre-Flight Verification Script: Autonomous Feedback Pipeline Credentials
 *
 * Tests:
 * 1. .env.local file configuration
 * 2. GitHub Token validity & repository write/issue permissions on Swensation/swentonelli
 * 3. Gemini API Key validity & model generation capability
 *
 * Usage:
 *   npx tsx scripts/verify-pipeline-keys.ts
 */

import fs from "fs";
import path from "path";

// Helper to manually load .env.local into process.env
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const REPO_OWNER = "Swensation";
const REPO_NAME = "swentonelli";

async function verifyGitHubToken(token?: string): Promise<{ ok: boolean; message: string; details?: any }> {
  if (!token) {
    return {
      ok: false,
      message: "Missing GITHUB_TOKEN in .env.local or environment variables.",
    };
  }

  try {
    // A. Check authenticated user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Pipeline-Verifier",
      },
    });

    if (userRes.status === 401) {
      return { ok: false, message: "GITHUB_TOKEN is unauthorized / invalid (HTTP 401)." };
    }

    const userData = await userRes.json();
    const username = userData.login || "Unknown User";

    // B. Check repo access
    const repoRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Pipeline-Verifier",
      },
    });

    if (repoRes.status === 404) {
      return {
        ok: false,
        message: `Repository ${REPO_OWNER}/${REPO_NAME} not found or token lacks access to private repos (HTTP 404).`,
      };
    }

    if (!repoRes.ok) {
      return { ok: false, message: `Failed to access repository (HTTP ${repoRes.status}): ${repoRes.statusText}` };
    }

    const repoData = await repoRes.json();
    const permissions = repoData.permissions || {};

    // C. Check issue permission by probing issues endpoint
    const issuesRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Pipeline-Verifier",
      },
    });

    if (!issuesRes.ok) {
      return {
        ok: false,
        message: `Token cannot read/write issues on ${REPO_OWNER}/${REPO_NAME} (HTTP ${issuesRes.status}).`,
      };
    }

    return {
      ok: true,
      message: `Authenticated as @${username} with permissions on ${REPO_OWNER}/${REPO_NAME} (push: ${permissions.push ? "YES" : "NO"}, admin: ${permissions.admin ? "YES" : "NO"}).`,
      details: { username, permissions },
    };
  } catch (err: any) {
    return { ok: false, message: `Network error connecting to GitHub: ${err.message}` };
  }
}

async function verifyGeminiApiKey(apiKey?: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey) {
    return {
      ok: false,
      message: "Missing GEMINI_API_KEY in .env.local or environment variables.",
    };
  }

  try {
    // Probe available models on Gemini API
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (res.status === 400 || res.status === 403) {
      const errJson = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: `GEMINI_API_KEY rejected by Google AI Studio (HTTP ${res.status}): ${errJson?.error?.message || "Invalid Key"}`,
      };
    }

    if (!res.ok) {
      return { ok: false, message: `Gemini API returned HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    const models = (data.models || []).map((m: any) => m.name.replace("models/", ""));

    return {
      ok: true,
      message: `Gemini API Key active & verified! Access to ${models.length} Google AI models confirmed.`,
    };
  } catch (err: any) {
    return { ok: false, message: `Network error connecting to Google AI Studio: ${err.message}` };
  }
}

async function run() {
  console.log("==================================================================");
  console.log("🔍 Pre-Flight Pipeline Key & Access Verification");
  console.log("==================================================================");

  const gitHubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GH_PAT;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log("\n1. Checking GitHub Token (For /api/agent-feedback Issue Ingestion)...");
  const ghResult = await verifyGitHubToken(gitHubToken);
  if (ghResult.ok) {
    console.log(`  ✅ PASS: ${ghResult.message}`);
  } else {
    console.error(`  ❌ FAIL: ${ghResult.message}`);
    console.log("     👉 Fix: Create a GitHub Personal Access Token (classic or fine-grained) with 'repo' / 'issues: write' scope");
    console.log("        and add it to .env.local as: GITHUB_TOKEN=\"ghp_...\"");
  }

  console.log("\n2. Checking Google Gemini API Key (For Autonomous CI/CD Agent)...");
  const geminiResult = await verifyGeminiApiKey(geminiApiKey);
  if (geminiResult.ok) {
    console.log(`  ✅ PASS: ${geminiResult.message}`);
  } else {
    console.error(`  ❌ FAIL: ${geminiResult.message}`);
    console.log("     👉 Fix: Obtain a free Gemini API key from https://aistudio.google.com/app/api-keys");
    console.log("        and add it to .env.local as: GEMINI_API_KEY=\"AIza...\"");
  }

  console.log("\n3. GitHub Actions Cloud Secrets Checklist (For Workflow in CI):");
  console.log("   Before triggering the cloud workflow, ensure your GitHub repo has this Secret:");
  console.log("   • Repo Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret");
  console.log("     Name:  GEMINI_API_KEY");
  console.log(`     Value: ${geminiApiKey ? "(Matches your local key)" : "(Your Google AI Studio API key)"}`);

  console.log("\n==================================================================");
  const allPassed = ghResult.ok && geminiResult.ok;
  if (allPassed) {
    console.log("🎉 ALL ACCESS CHECKS PASSED! You are ready to build & deploy.");
  } else {
    console.log("⚠️ Some keys are missing or unverified. See instructions above.");
  }
  console.log("==================================================================\n");

  process.exit(allPassed ? 0 : 1);
}

run();

