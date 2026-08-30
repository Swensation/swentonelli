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
        name: "replace_file_content",
        description: "Replace an exact target block of text in a file with new content. Atomic, surgical, and prevents sed errors.",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path from workspace root" },
            target_content: { type: "STRING", description: "Exact text block in the file to replace (must match exactly)" },
            replacement_content: { type: "STRING", description: "New text to replace target_content with" },
          },
          required: ["file_path", "target_content", "replacement_content"],
        },
      },
      {
        name: "grep_search",
        description: "Fast pattern or keyword search across files in the workspace",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "String or pattern to search for" },
            path_pattern: { type: "STRING", description: "Optional path or directory filter (e.g. 'src/')" },
          },
          required: ["query"],
        },
      },
      {
        name: "view_file",
        description: "Read file contents, optionally specifying start_line and end_line slices (1-indexed)",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Relative file path from workspace root" },
            start_line: { type: "INTEGER", description: "Optional starting line number (1-indexed)" },
            end_line: { type: "INTEGER", description: "Optional ending line number (1-indexed)" },
          },
          required: ["file_path"],
        },
      },
      {
        name: "write_file",
        description: "Create a new file or completely overwrite an existing file",
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
        description: "Run a safe inspection shell command (do NOT use for sed or file editing)",
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
      if (name === "replace_file_content") {
        const full = path.resolve(process.cwd(), args.file_path);
        if (!fs.existsSync(full)) return `Error: File '${args.file_path}' not found.`;
        const content = fs.readFileSync(full, "utf-8");

        // 1. Exact match
        if (content.includes(args.target_content)) {
          const updated = content.replace(args.target_content, args.replacement_content);
          fs.writeFileSync(full, updated, "utf-8");
          return `Successfully replaced target content in '${args.file_path}'.`;
        }

        // 2. Normalized CRLF / LF match
        const normContent = content.replace(/\r\n/g, "\n");
        const normTarget = args.target_content.replace(/\r\n/g, "\n");
        if (normContent.includes(normTarget)) {
          const normReplacement = args.replacement_content.replace(/\r\n/g, "\n");
          const updated = normContent.replace(normTarget, normReplacement);
          fs.writeFileSync(full, updated, "utf-8");
          return `Successfully replaced normalized target content in '${args.file_path}'.`;
        }

        // 3. Helpful near-match diagnostic
        const firstLine = args.target_content.trim().split("\n")[0].trim();
        const lines = content.split("\n");
        const nearMatches = lines
          .map((l, i) => ({ line: i + 1, text: l }))
          .filter((l) => l.text.includes(firstLine.slice(0, 30)))
          .slice(0, 3);
        const hint = nearMatches.length
          ? ` Hint: Similar line found at Line ${nearMatches.map((m) => m.line).join(", ")}. View that range first.`
          : "";
        return `Error: target_content not found in '${args.file_path}'.${hint}`;
      }
      if (name === "grep_search") {
        try {
          const filter = args.path_pattern ? ` ${args.path_pattern}` : "";
          const out = execSync(`git grep -n "${args.query.replace(/"/g, '\\"')}" --${filter}`, {
            stdio: "pipe",
            timeout: 30000,
          }).toString();
          return out.slice(0, 3000) || "No matches found.";
        } catch {
          return "No matches found.";
        }
      }
      if (name === "view_file") {
        const full = path.resolve(process.cwd(), args.file_path);
        if (!fs.existsSync(full)) return `Error: File '${args.file_path}' not found.`;
        const lines = fs.readFileSync(full, "utf-8").split("\n");
        const start = args.start_line ? Math.max(1, parseInt(args.start_line, 10)) : 1;
        const end = args.end_line ? Math.min(lines.length, parseInt(args.end_line, 10)) : lines.length;
        const sliced = lines.slice(start - 1, end).map((l, i) => `${start + i}: ${l}`);
        return sliced.join("\n").slice(0, 4500);
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
        if (cmd.includes("rm -rf /") || cmd.includes("format ") || cmd.startsWith("sed ")) {
          return "Error: Command rejected. For code editing, use replace_file_content.";
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

    let lessonsLearned = "";
    const lessonsPath = path.resolve(process.cwd(), ".harness/memory/lessons.md");
    if (fs.existsSync(lessonsPath)) {
      lessonsLearned = "\n\n### Repository Memory (Lessons Learned from Past Runs):\n" + fs.readFileSync(lessonsPath, "utf-8");
    }

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
Your mission: Implement the approved specification cleanly, surgically, and decisively.

Rules:
1. TOOLING PARITY: Always use 'replace_file_content' for surgical edits. Never use sed, cat, or shell commands to edit code.
2. ACTION EFFICIENCY: You have an exploration budget of at most 2 turns (using grep_search or view_file slices). By Turn 3, you MUST call replace_file_content or write_file to apply the code changes.
3. ANTI-RULE BEATING: You must modify the target feature files requested in the specification. Modifying only build-meta.json or test files without touching the feature components is strictly rejected.
4. Conclude with a clear summary once file edits are written.${lessonsLearned}`,
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

