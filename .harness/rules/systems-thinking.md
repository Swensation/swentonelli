# Systems Thinking & Autonomous Loop Invariants (Donella Meadows Framework)

This document establishes the operational principles, system-trap defenses, and design invariants that govern all agents in the Autonomous Engineering Harness.

---

## 1. Core Vocabulary (Donella Meadows, *Thinking in Systems*)

When analyzing tasks, failure traces, or code changes, agents must reason using these system concepts:

* **Stocks**: Accumulations of state built over time (e.g., codebase diffs, test coverage, technical debt, context window capacity, API rate-limit quotas).
* **Flows**: Inflows and outflows that change stocks (e.g., tool calls per minute, commits added, code churn, token consumption).
* **Feedback Loops**:
  * **Balancing Loops (Goal-Seeking / Stabilizing)**: Compilers, typecheckers, unit tests, and lint gates that pull the candidate code toward correctness.
  * **Reinforcing Loops (Self-Amplifying)**: Amnesiac failure spirals (failing -> resetting -> failing), API quota burn loops, compounding merge conflicts.
* **Delays**: Time lag between an intervention and its observable effect (e.g., GitHub Actions queue times, Gemini 60-second rolling quota windows).
* **Bounded Rationality**: An agent acting on local information (e.g., "make `npm test` exit with 0") that violates the macro goal of the system (shipping the user's requested feature).

---

## 2. System Traps & How the Harness Defeats Them

| System Trap | Failure Pattern in Autonomous Coding | Harness Architectural Defense |
| :--- | :--- | :--- |
| **Seeking the Wrong Goal** | The agent optimizes for a proxy indicator (making tests green) by wiping candidate code or deleting assertions, failing the true goal. | **Invariant 1: Feature Verification Gate.** The harness inspects the git diff. A green test run without modifying the target files from the Spec is treated as a defect. |
| **Shifting the Burden** | Treating symptoms with emergency rollbacks (`git reset --hard`) instead of diagnosing and healing the root cause, eroding self-maintenance. | **Invariant 2: Preserved State (Never Wipeout).** Failures must commit candidate diffs to a WIP checkpoint. The Surgeon receives the patch + the failure trace. |
| **Rule Beating** | Obeying the letter of the rules (making the CI check pass) while defeating the spirit (no functional code was delivered). | **Invariant 3: Dual Evaluation.** The harness evaluates both *Syntax/Behavioral Correctness* (test suite) and *Intent Fulfillment* (spec checklist). |
| **Drift to Low Performance** | Accepting degraded agent behavior or lower test coverage because "at least it compiled." | **Invariant 4: Absolute Standards.** Baseline regression tests must remain 100% green; assertions cannot be weakened to accommodate a patch. |
| **Policy Resistance** | Coding agent and healing agent working against conflicting goals or overwriting each other's work. | **Invariant 5: State Machine Handoff.** Strictly sequential phases: Intake -> Candidate Patch -> External Evaluation -> Reflexion Repair. |

---

## 3. The Reflexion Architecture (The Self-Healing Loop)

To prevent amnesiac loops, the harness implements the **Actor-Evaluator-Reflector** triad:

1. **The Actor (Coder)**:
   * Consumes: Acceptance Specification.
   * Produces: Candidate Patch (Diff).
   * Invariant: Never executes test evaluations directly inside its generative loop; it hands the diff off.
2. **The Evaluator (Test Gate)**:
   * External, immutable runner (e.g., `npm test`, `pytest`, `matlab -batch "runtests"`).
   * Produces: Evaluation Matrix (Pass/Fail, stdout, stderr, execution traces).
   * Invariant: Runs independent of agent influence.
3. **The Reflector (Surgeon)**:
   * Consumes: `Spec` + `Candidate Patch` + `Evaluation Matrix`.
   * Produces: Delta Patch (Surgeon modifies the specific failing lines rather than starting over).
   * Invariant: Operates on delta evidence, never an empty branch.

---

## 4. Operational Invariants for All Autonomous Scripts

1. **Idempotence**: Every script must check state before acting. Re-running a step must not duplicate PRs, corrupt git branches, or spam comments.
2. **Deterministic Priority**: High-leverage rules always override low-leverage ones (Meadows Leverage Points).
3. **No Secrets in Code**: API keys and tokens must strictly flow through environment variables.
4. **Adaptive Pacing**: Protect the API quota stock. Always pace inter-turn tool calls (minimum 4-second delay) and implement exponential backoff on HTTP 429.

