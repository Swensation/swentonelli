/**
 * Intake: Autonomous Triage Engine
 * Consumes raw human feedback/issues, clusters them, filters noise,
 * and synthesizes structured Functional Pull Requests with an execution checkbox.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { HarnessConfig, IntakeItem, ProposalSpec } from "./types";
import { AdaptiveRateLimiter } from "./rate-limiter";

export class TriageEngine {
  private config: HarnessConfig;
  private apiKey: string;
  private githubToken: string;
  private rateLimiter: AdaptiveRateLimiter;

  constructor(config: HarnessConfig, apiKey: string, githubToken: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.githubToken = githubToken;
    this.rateLimiter = new AdaptiveRateLimiter(
      config.llm.interTurnDelayMs,
      config.llm.rateLimitBackoffMultiplierMs
    );
  }

  async fetchPendingIssues(): Promise<IntakeItem[]> {
    const url = `https://api.github.com/repos/${this.config.git.repoOwner}/${this.config.git.repoName}/issues?state=open&per_page=50`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Autonomous-Harness",
      },
    });

    if (!res.ok) throw new Error(`GitHub API error (${res.status}): ${await res.text()}`);
    const issues: any[] = await res.json();

    return issues
      .filter((i) => !i.pull_request) // Exclude PRs
      .map((i) => ({
        id: i.number,
        source: "github_issue",
        title: i.title,
        rawText: i.body || "",
        author: i.user?.login,
        createdAt: i.created_at,
        labels: (i.labels || []).map((l: any) => l.name),
      }));
  }

  async synthesizeProposal(items: IntakeItem[]): Promise<ProposalSpec> {
    const prompt = `You are the Autonomous Triage Agent for ${this.config.project.name}.
Review these open feedback items and synthesize a unified, actionable Specification.

Items:
${JSON.stringify(items, null, 2)}

Instructions:
1. Filter out noise or accidental tests.
2. Group related items into a coherent engineering specification.
3. Define concrete acceptance criteria.
4. Format output in clean Markdown with:
   - [ ] **Ready to execute**: Check this box to start autonomous implementation`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.llm.primaryModel}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) throw new Error(`Triage generation error (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const body = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const issueIds = items.map((i) => i.id);
    const title = `[Functional Pull Request] Triaged Feedback (Issues ${issueIds.map((id) => `#${id}`).join(", ")})`;

    return {
      title,
      body,
      sourceIssueNumbers: issueIds,
      acceptanceCriteria: [],
      targetFiles: [],
    };
  }

  async createFunctionalPR(spec: ProposalSpec): Promise<{ prNumber: number; branch: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const branch = `${this.config.git.proposalBranchPrefix}${timestamp}`;

    // Create branch from default branch
    execSync(`git checkout -b ${branch}`, { stdio: "pipe" });

    // Save spec file to repo
    const specDir = path.resolve(process.cwd(), this.config.paths.specDirectory);
    if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });
    const specFilePath = path.join(specDir, `triage-${timestamp}.md`);
    fs.writeFileSync(specFilePath, spec.body, "utf-8");

    execSync("git add .", { stdio: "inherit" });
    execSync(`git commit -m "docs: functional pull request proposal for ${spec.sourceIssueNumbers.length} items"`, {
      stdio: "inherit",
    });
    execSync(`git push -u origin ${branch}`, { stdio: "inherit" });

    // Open Pull Request via GitHub API
    const prRes = await fetch(
      `https://api.github.com/repos/${this.config.git.repoOwner}/${this.config.git.repoName}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Autonomous-Harness",
        },
        body: JSON.stringify({
          title: spec.title,
          body: spec.body,
          head: branch,
          base: this.config.git.defaultBranch,
        }),
      }
    );

    if (!prRes.ok) throw new Error(`Failed to create PR (${prRes.status}): ${await prRes.text()}`);
    const prData = await prRes.json();
    console.log(`🎉 [Triage] Created Functional PR #${prData.number} on branch '${branch}'`);

    return { prNumber: prData.number, branch };
  }
}

