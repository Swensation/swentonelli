# Project Rules & Systems Thinking Guidelines (Swentonelli Dashboard)

This project operates under the Donella Meadows Systems Thinking framework and the Autonomous Engineering Harness.

See global preferences in `~/.gemini/config/plugins/user-preferences-plugin/rules/AGENTS.md`.

## Core Invariants for this Repository
1. **Never Destroy State on Failure**: Do not run `git reset --hard` when a test or build fails during autonomous execution. Commit candidate diffs to a `wip(harness-candidate)` checkpoint so the Pipeline Surgeon can repair the delta.
2. **Anti-Rule Beating**: Evaluation gates must verify both test execution and that target feature files were actually touched.
3. **Status Update Format**: Keep status updates simple, concise, and direct (plain text or brief bullet points). Do not format status updates as systems-thinking tables.
4. **Tooling Parity Invariant**: Cloud runners in GitHub Actions must execute with the exact same high-conviction tools (`replace_file_content`, `grep_search`, slice-based `view_file`) as local Antigravity sessions. Primitive shell paging loops (`sed`/`cat`) are strictly prohibited.
5. **External Resource Validation Invariant**: Any external resource URL added to the system (calendar ICS feeds, school lunch URLs, APIs, images) must be actively probed for HTTP 200 reachability and payload integrity before being merged. Unreachable or unauthenticated URLs (401/403/404) must fail the evaluation gate or be tagged for human review.
6. **Family Contributor Onboarding Protocol**: When prompted to onboard a child or family member (e.g. Bennett, Brighton, Aria, Benjamin), the agent must inspect Git config, authenticate GitHub via `gh auth login`, check access to `Swensation/swentonelli`, verify or safely prompt for `.env.local` Gemini keys, run `npm test`, and verify the local server runs without error.
7. **Automation Architecture & Living Pipeline Diagram Invariant**: All automated and scheduled pipelines (Plaud voice tasks, calendar ingestion, school lunch menus, SmartThings/HVAC telemetry, and housekeeping radar) must adhere to the 5-stage causal architecture model:
   - **Stage 1 (Physical Origin)**: Real-world human or physical device event.
   - **Stage 2 (Upstream Staging)**: External cloud service or file where raw state accumulates.
   - **Stage 3 (Activation Trigger)**: Exact schedule (Cloud Scheduler cron), reactive webhook, or manual admin dispatch.
   - **Stage 4 (Local Processing & Decision Gates)**: Transformation code, filters (personal vs. work), deduplication ledgers, and routing rules.
   - **Stage 5 (Tangible Concrete Result)**: Concrete state mutation (Google Tasks created, calendar cache updated, widgets refreshed, admin telemetry emitted).
   Any addition, removal, or modification of automation workflows MUST update this living architecture diagram and ensure it is directly embedded and rendered in the Dad Admin Dashboard (`/admin`). Untracked or undocumented background jobs are strictly prohibited.
8. **Terse, Scannable UI Invariant**: All UI text, badges, titles, and descriptions across the dashboard and admin must be terse, dense, and immediately scannable. Redundant labels (e.g. repeating a button's label in a header below it), conversational preambles, philosophical questions (e.g. "How did this come to exist?"), and debugging fluff are strictly prohibited. The interface is engineered for rapid visual parsing and glanceable operations, not reading.

