# Autonomous Engineering Memory Ledger (Lessons Learned)

This file stores accumulated operational lessons, repository invariants, and subtle traps discovered by autonomous agents across previous runs.
Agents dynamically consume this memory before generating candidate diffs.

---

## 1. Repository Architecture Invariants
- **Child Signature Colors**: Brighton, Bennett, Benjamin, and Aria signature colors are defined across multiple files: data/children_registry.json, config/event_rules.json, src/lib/eventRules.ts, and src/components/widgets/CalendarWidget/KidsColumnTimeline.tsx. Always update all matching instances together.
- **Custody & Calendar Timelines**: Events with all-day UTC midnight timestamps must remain strictly mapped to local dates. Do not introduce UTC date offset calculations.
- **Admin missingIcons Radar**: Strictly excludes custody and no-school annotation events. Do not map annotations into missing icons.

## 2. Tooling & Execution Invariants
- **Tooling Parity**: Always use replace_file_content for surgical code edits. Never use sed, cat, or raw shell commands to edit code.
- **Anti-Rule Beating**: Evaluation strictly fails if the candidate patch only touches build-meta.json or tests without modifying the feature components requested in the spec.
- **Turn Budget**: Never spend more than 2 turns exploring (grep_search / view_file). Begin writing code modifications by Turn 3.
- **Whitespace Normalization**: If replace_file_content returns a near-match hint, check the reported line numbers immediately and use the exact indentation.
