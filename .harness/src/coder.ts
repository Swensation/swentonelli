/**
 * Actor: Autonomous Coding Agent
 * Transforms Acceptance Specs into Candidate Patches.
 * Enforces Invariant 2 (Preserved State on Failure).
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { HarnessConfig, ProposalSpec } from "./types";
import { AdaptiveRateLimiter } from "./rate-limiter";
import { TestEvaluator } from "./evaluator";

export class CodingAgent {
  private config: HarnessConfig;
  private rateLimiter: AdaptiveRateLimiter;
  private evaluator: TestEvaluator;
  private apiKey: string;

  constructor(config: HarnessConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.rateLimiter = new AdaptiveRateLimiter(
      config.llm.interTurnDelayMs,
      config.llm.rateLimitBackoffMultiplierMs
    );
    this.evaluator = new TestEvaluator(config);
  }

  /**
   * Tool Declarations for generic codebase navigation
   */
  private getToolDeclarations() {
    return [
      {
        name: "view_file",
        description: "Read the content of a file in the workspace",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path from workspace root" },
          },
          required: ["file_path"],
        },
      },
      {
        name: "write_file",
        description: "Create or overwrite a file with updated code",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path from workspace root" },
            content: { type: "STRING", description: "Complete file contents" },
          },
          required: ["file_path", "content"],
        },
      },
      {
        name: "list_dir",
        description: "List directory contents",
        parameters: {
          type: "OBJECT",
          properties: {
            dir_path: { type: "STRING", description: "Directory path relative to root" },
          },
          required: ["dir_path"],
        },
      },
      {
        name: "run_command",
        description: "Run a safe shell command for inspection (e.g. git status, grep)",
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
        return content.length > 4000 ? content.slice(0, 4000) + "\n...(truncated)" : content;
      }
      if (name === "write_file") {
        const full = path.resolve(process.cwd(), args.file_path);
        const dir = path.dirname(full);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(full, args.content, "utf-8");
        return `Successfully wrote ${args.content.length} characters to '${args.file_path}'.`;
      }
      if (name === "list_dir") {
        const full = path.resolve(process.cwd(), args.dir_path || ".");
        if (!fs.existsSync(full)) return `Error: Directory not found.`;
        return JSON.stringify(
          fs.readdirSync(full, { withFileTypes: true }).map((e) => ({
            name: e.name,
            type: e.isDirectory() ? "dir" : "file",
          }))
        );
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
                text: `You are the Autonomous Coding Agent for ${this.config.project.name}.
Your mission: Implement the approved specification cleanly, surgically, and robustly.
Rules:
1. Examine existing files first before making modifications.
2. Implement surgical, high-conviction code changes.
3. Conclude with a clear summary of files modified.`,
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
          console.warn(`[CodingAgent] Model ${model} HTTP ${res.status}: ${errText.slice(0, 100)}`);

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
          console.warn(`[CodingAgent] Network error: ${err.message}`);
          await this.rateLimiter.handleCongestion(attempt, model);
        }
      }
    }
    throw new Error("All LLM models exhausted during code generation.");
  }

  /**
   * Execute code generation with state preservation
   */
  async execute(spec: ProposalSpec, prNumber: string, branch: string): Promise<boolean> {
    console.log(`🚀 [CodingAgent] Starting implementation for PR #${prNumber} on branch '${branch}'`);

    const prompt = `Implement this approved specification on repository '${this.config.project.name}':

## Specification Title: ${spec.title}

${spec.body}

Instructions:
1. Inspect the relevant source files.
2. Apply the requested enhancements or fixes.
3. Conclude once code edits are written.`;

    const contents: any[] = [{ role: "user", parts: [{ text: prompt }] }];

    for (let turn = 1; turn <= this.config.llm.maxTurnsPerTask; turn++) {
      console.log(`\n--- Coding Turn ${turn} ---`);
      await this.rateLimiter.paceTurn();

      const response = await this.callGemini(contents);
      const candidate = response.candidates?.[0];
      if (!candidate) break;

      const modelParts = candidate.content.parts || [];
      contents.push({ role: "model", parts: modelParts });

      for (const part of modelParts) {
        if (part.text) console.log(part.text);
      }

      const functionCalls = modelParts.filter((p: any) => !!p.functionCall);
      if (functionCalls.length === 0) {
        console.log("✅ Code edits completed.");
        break;
      }

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

    // --- EVALUATION GATE ---
    console.log("\n==================================================================");
    console.log("🧪 [Evaluator] Running External Test & Quality Gate");
    console.log("==================================================================");

    const evalResult = this.evaluator.evaluate();

    if (evalResult.passed && evalResult.hasTargetFileModifications) {
      console.log("✅ Evaluation PASSED! Target files modified and all tests pass.");
      execSync("git add .", { stdio: "inherit" });
      execSync(`git commit -m "feat(harness): implement approved proposal for PR #${prNumber}"`, {
        stdio: "inherit",
      });
      execSync(`git push origin ${branch}`, { stdio: "inherit" });
      return true;
    }

    // --- INVARIANT 2: PRESERVE STATE ON FAILURE (NEVER RESET --HARD) ---
    console.warn("⚠️ Evaluation FAILED. Preserving Candidate Patch as WIP evidence checkpoint...");
    execSync("git add .", { stdio: "inherit" });
    try {
      execSync(
        `git commit -m "${this.config.git.wipCommitPrefix} candidate patch for PR #${prNumber} (evaluation failed)"`,
        { stdio: "inherit" }
      );
      execSync(`git push origin ${branch}`, { stdio: "inherit" });
      console.log(`💾 Candidate Patch preserved on branch '${branch}'. Ready for Surgeon.`);
    } catch (e) {
      console.warn("No unstaged changes to commit for WIP checkpoint.");
    }

    return false;
  }
}

