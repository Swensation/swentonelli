/**
 * Independent Evaluation Engine (Test Gate)
 * Acts as the immutable external referee.
 * Decoupled from agent generation to enforce Invariant 1 (Anti-Rule Beating).
 */

import { execSync } from "child_process";
import { EvaluationResult, HarnessConfig } from "./types";

export class TestEvaluator {
  private config: HarnessConfig;

  constructor(config: HarnessConfig) {
    this.config = config;
  }

  /**
   * Run the evaluation suite and inspect both test status and git diff.
   */
  evaluate(): EvaluationResult {
    let typecheckPassed = true;
    let testsPassed = true;
    let fullStdout = "";
    let fullStderr = "";
    let exitCode = 0;
    let failureSummary = "";

    // 1. Run Typecheck if configured
    if (this.config.evaluation.typecheckCommand) {
      try {
        const out = execSync(this.config.evaluation.typecheckCommand, {
          stdio: "pipe",
          timeout: 60000,
        }).toString();
        fullStdout += `--- Typecheck Output ---\n${out}\n`;
      } catch (err: any) {
        typecheckPassed = false;
        exitCode = err.status || 1;
        const errOut = err.stdout?.toString() || "";
        const errErr = err.stderr?.toString() || err.message;
        fullStderr += `--- Typecheck Failure ---\n${errOut}\n${errErr}\n`;
        failureSummary += `Typecheck Error: ${errErr.slice(0, 300)}\n`;
      }
    }

    // 2. Run Test Gate Command
    try {
      const testOut = execSync(this.config.evaluation.testCommand, {
        stdio: "pipe",
        timeout: 90000,
      }).toString();
      fullStdout += `--- Test Output ---\n${testOut}\n`;
    } catch (err: any) {
      testsPassed = false;
      exitCode = err.status || 1;
      const errOut = err.stdout?.toString() || "";
      const errErr = err.stderr?.toString() || err.message;
      fullStderr += `--- Test Gate Failure ---\n${errOut}\n${errErr}\n`;
      failureSummary += `Test Gate Error: ${errOut.slice(-500) || errErr.slice(0, 500)}\n`;
    }

    // 3. Inspect Modified Files (Git Diff)
    const modifiedTargetFiles: string[] = [];
    try {
      const gitDiff = execSync("git status --porcelain", { stdio: "pipe" }).toString();
      for (const line of gitDiff.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const filePath = trimmed.replace(/^[MADRCU?!]{1,2}\s+/, "");
        // Exclude ephemeral / build meta files
        if (!filePath.includes("build-meta.json") && !filePath.includes("test_output")) {
          modifiedTargetFiles.push(filePath);
        }
      }
    } catch (err) {
      console.warn("Could not inspect git status:", err);
    }

    const hasTargetFileModifications = modifiedTargetFiles.length > 0;
    const passed = typecheckPassed && testsPassed;

    return {
      passed,
      typecheckPassed,
      testsPassed,
      exitCode,
      stdout: fullStdout,
      stderr: fullStderr,
      failureSummary: failureSummary || (passed ? undefined : "Evaluation gate failed."),
      modifiedTargetFiles,
      hasTargetFileModifications,
    };
  }
}

