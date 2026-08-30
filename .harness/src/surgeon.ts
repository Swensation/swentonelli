/**
 * Reflector: Autonomous Pipeline Surgeon
 * Implements the Reflexion self-healing loop:
 * Inputs: Spec + Candidate Patch Diff + Evaluation Failure Trace
 * Output: Delta Repair + RCA Post-Mortem Report
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { HarnessConfig, ProposalSpec } from "./types";
import { AdaptiveRateLimiter } from "./rate-limiter";
import { TestEvaluator } from "./evaluator";

export class PipelineSurgeon {
  private config: HarnessConfig;
  private rateLimiter: AdaptiveRateLimiter;
  private evaluator: TestEvaluator;
  private apiKey: string;
  private githubToken: string;

  constructor(config: HarnessConfig, apiKey: string, githubToken: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.githubToken = githubToken;
    this.rateLimiter = new AdaptiveRateLimiter(
      config.llm.interTurnDelayMs,
      config.llm.rateLimitBackoffMultiplierMs
    );
    this.evaluator = new TestEvaluator(config);
  }

  private getToolDeclarations() {
    return [
      {
        name: "view_file",
        description: "Read file contents",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path" },
          },
          required: ["file_path"],
        },
      },
      {
        name: "write_file",
        description: "Update or patch file contents",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path" },
            content: { type: "STRING", description: "Complete patched contents" },
          },
          required: ["file_path", "content"],
        },
      },
      {
        name: "run_command",
        description: "Execute a command for verification or inspection",
        parameters: {
          type: "OBJECT",
          properties: {
            command: { type: "STRING", description: "Shell command" },
          },
          required: ["command"],
        },
      },
    ];
  }

  private executeTool(name: string, args: any): string {
    try {
      if (name === "view_file") {
        const full = path.resolve(process.cwd(), args.file_path);
        if (!fs.existsSync(full)) return `Error: File '${args.file_path}' not found.`;
        const content = fs.readFileSync(full, "utf-8");
        return content.length > 5000 ? content.slice(0, 5000) + "\n...(truncated)" : content;
      }
      if (name === "write_file") {
        const full = path.resolve(process.cwd(), args.file_path);
        const dir = path.dirname(full);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(full, args.content, "utf-8");
        return `Successfully wrote ${args.content.length} characters to '${args.file_path}'.`;
      }
      if (name === "run_command") {
        const cmd = args.command;
        if (cmd.includes("rm -rf /") || cmd.includes("format ")) {
          return "Error: Command rejected by safety policy.";
        }
        const out = execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString();
        return out.length > 3000 ? out.slice(0, 3000) + "\n...(truncated)" : out || "(Success)";
      }
      return `Error: Unknown tool '${name}'`;
    } catch (err: any) {
      const out = err.stdout?.toString() || err.stderr?.toString() || err.message;
      return `Execution Error: ${out.slice(0, 2000)}`;
    }
  }

  private async callGemini(contents: any[]) {
    const models = [this.config.llm.primaryModel, ...this.config.llm.fallbackModels];

    for (const model of models) {
      for (let attempt = 1; attempt <= 4; attempt++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const body = {
          contents,
          tools: [{ functionDeclarations: this.getToolDeclarations() }],
          systemInstruction: {
            parts: [
              {
                text: `You are the Autonomous Pipeline Surgeon for ${this.config.project.name}.
You operate under Donella Meadows Systems Thinking Principles:
1. Do not seek the wrong goal (do not declare success if target feature files were reverted).
2. Inspect the candidate diff that was attempted and the compiler/test error trace.
3. Formulate and implement the precise delta repair.
4. Conclude with an RCA post-mortem summary.`,
              },
            ],
          },
        };

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (res.ok) return await res.json();

          const errText = await res.text();
          console.warn(`[Surgeon] Model ${model} HTTP ${res.status}: ${errText.slice(0, 100)}`);

          if (res.status === 429) {
            await this.rateLimiter.handleRateLimit(attempt, model);
            continue;
          }
          if (res.status === 503) {
            await this.rateLimiter.handleCongestion(attempt, model);
            continue;
          }
          break;
        } catch (err: any) {
          console.warn(`[Surgeon] Network error: ${err.message}`);
          await this.rateLimiter.handleCongestion(attempt, model);
        }
      }
    }
    throw new Error("All LLM models exhausted during surgery.");
  }

  /**
   * Execute Autonomous Surgery on a failing PR
   */
  async remediate(prNumber: string, branch: string, spec: ProposalSpec): Promise<boolean> {
    console.log(`🩺 [Surgeon] Activated for PR #${prNumber} on branch '${branch}'`);

    // 1. Capture the Candidate Diff from git history
    let candidateDiff = "";
    try {
      candidateDiff = execSync("git diff HEAD~1 HEAD", { stdio: "pipe" }).toString();
    } catch {
      try {
        candidateDiff = execSync("git diff origin/main HEAD", { stdio: "pipe" }).toString();
      } catch (e) {
        candidateDiff = "(Could not extract git diff)";
      }
    }

    // 2. Capture Current Evaluation Failure Trace
    const evalResult = this.evaluator.evaluate();
    const failureTrace = evalResult.passed
      ? "Tests currently pass, but verify that target feature files were modified."
      : evalResult.stderr || evalResult.stdout || evalResult.failureSummary;

    const prompt = `A previous implementation attempt on PR #${prNumber} failed evaluation.

### Original Specification:
${spec.title}
${spec.body}

### Candidate Patch Attempted (Preserved Git Diff):
\`\`\`diff
${candidateDiff.slice(0, 4000)}
\`\`\`

### Evaluation Failure Trace:
\`\`\`text
${failureTrace.slice(0, 3000)}
\`\`\`

### Your Mission:
1. Analyze why the candidate patch caused the failure.
2. Formulate and write the surgical delta repair to fix the defect.
3. Ensure the feature code is NOT erased or reverted.
4. Conclude with an RCA post-mortem summary.`;

    const contents: any[] = [{ role: "user", parts: [{ text: prompt }] }];
    let finalSummary = "";

    for (let turn = 1; turn <= 12; turn++) {
      console.log(`\n--- Surgeon Turn ${turn} ---`);
      await this.rateLimiter.paceTurn();

      const response = await this.callGemini(contents);
      const candidate = response.candidates?.[0];
      if (!candidate) break;

      const modelParts = candidate.content.parts || [];
      contents.push({ role: "model", parts: modelParts });

      for (const part of modelParts) {
        if (part.text) {
          console.log(part.text);
          finalSummary = part.text;
        }
      }

      const functionCalls = modelParts.filter((p: any) => !!p.functionCall);
      if (functionCalls.length === 0) break;

      const toolResponses: any[] = [];
      for (const call of functionCalls) {
        const fnName = call.functionCall.name;
        const fnArgs = call.functionCall.args || {};
        console.log(`🔧 Tool: ${fnName}(${JSON.stringify(fnArgs)})`);
        let result = this.executeTool(fnName, fnArgs);
        toolResponses.push({
          functionResponse: { name: fnName, response: { result } },
        });
      }

      contents.push({ role: "user", parts: toolResponses });
    }

    // --- RE-EVALUATION GATE ---
    console.log("\n==================================================================");
    console.log("🧪 [Surgeon] Verifying Post-Surgery Evaluation Gate");
    console.log("==================================================================");

    const postSurgeryEval = this.evaluator.evaluate();

    if (postSurgeryEval.passed) {
      console.log("✅ Post-surgery evaluation PASSED cleanly!");
      execSync("git add .", { stdio: "inherit" });
      execSync(
        `git commit -m "${this.config.git.autoHealCommitPrefix} apply autonomous RCA repairs for PR #${prNumber}"`,
        { stdio: "inherit" }
      );
      execSync(`git push origin ${branch}`, { stdio: "inherit" });

      // Post RCA report comment to GitHub PR
      try {
        await fetch(
          `https://api.github.com/repos/${this.config.git.repoOwner}/${this.config.git.repoName}/issues/${prNumber}/comments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "Autonomous-Harness",
            },
            body: JSON.stringify({
              body: `🩺 **Autonomous Pipeline Surgeon**: Root cause analyzed and delta repair applied!\n\n${finalSummary}\n\nAll verification tests pass. Healed commit pushed to branch.`,
            }),
          }
        );
      } catch (err) {
        console.warn("Could not post comment to PR:", err);
      }

      return true;
    }

    console.error("❌ Post-surgery evaluation still failing. Tagging for human review.");
    return false;
  }
}

