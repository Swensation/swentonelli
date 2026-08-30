/**
 * Core Types for the Autonomous Engineering Harness
 * Fully decoupled from any specific web framework or product domain.
 */

export interface HarnessConfig {
  project: {
    name: string;
    description: string;
  };
  evaluation: {
    typecheckCommand?: string;
    testCommand: string;
    buildCheckCommand?: string;
  };
  git: {
    repoOwner: string;
    repoName: string;
    defaultBranch: string;
    proposalBranchPrefix: string;
    wipCommitPrefix: string;
    autoHealCommitPrefix: string;
  };
  paths: {
    specDirectory: string;
    targetSourceDirectories: string[];
  };
  llm: {
    primaryModel: string;
    fallbackModels: string[];
    interTurnDelayMs: number;
    rateLimitBackoffMultiplierMs: number;
    maxTurnsPerTask: number;
  };
  resilience: {
    maxAutoHealAttempts: number;
    preserveDiffOnFailure: boolean;
  };
}

export interface IntakeItem {
  id: number | string;
  source: string;
  title: string;
  rawText: string;
  author?: string;
  createdAt: string;
  labels: string[];
}

export interface ProposalSpec {
  title: string;
  body: string;
  sourceIssueNumbers: (number | string)[];
  acceptanceCriteria: string[];
  targetFiles: string[];
}

export interface CandidatePatch {
  branch: string;
  commitSha?: string;
  modifiedFiles: string[];
  diffSummary: string;
  createdSuccessfully: boolean;
}

export interface EvaluationResult {
  passed: boolean;
  typecheckPassed?: boolean;
  testsPassed: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  failureSummary?: string;
  modifiedTargetFiles: string[];
  hasTargetFileModifications: boolean;
}

export interface RCAReport {
  prNumber: string;
  defectCategory: "CODE_DEFECT" | "ENVIRONMENT_DEFECT" | "RATE_LIMIT" | "SPEC_AMBIGUITY";
  rootCauseAnalysis: string;
  remedialPatchSummary: string;
  verifiedPassing: boolean;
  filesModified: string[];
}

