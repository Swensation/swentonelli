# Project Rules & Systems Thinking Guidelines (Swentonelli Dashboard)

This project operates under the Donella Meadows Systems Thinking framework and the Autonomous Engineering Harness.

See global preferences in `~/.gemini/config/plugins/user-preferences-plugin/rules/AGENTS.md`.

## Core Invariants for this Repository
1. **Never Destroy State on Failure**: Do not run `git reset --hard` when a test or build fails during autonomous execution. Commit candidate diffs to a `wip(harness-candidate)` checkpoint so the Pipeline Surgeon can repair the delta.
2. **Anti-Rule Beating**: Evaluation gates must verify both test execution and that target feature files were actually touched.
3. **Status Update Format**: Always render status updates as a structured Systems Thinking Markdown table:
   - System Goal
   - Stock Transformed
   - Active Loop
   - Delays & Velocity
4. **Tooling Parity Invariant**: Cloud runners in GitHub Actions must execute with the exact same high-conviction tools (`replace_file_content`, `grep_search`, slice-based `view_file`) as local Antigravity sessions. Primitive shell paging loops (`sed`/`cat`) are strictly prohibited.

