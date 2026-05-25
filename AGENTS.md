# AGENTS.md

Single workflow entry point for AI coding tools in this repository.

## Required Reading

Primary sources:

- `PROJECT.md` - Human-owned project context
- `.aidw/AI_project.md` - Generated AI context (from scan)

Read first:

- PROJECT.md
- .aidw/AI_project.md
- .aidw/rules.md
- .aidw/rules-canonical.md
- .aidw/workflow.md
- .aidw/safety.md
- .aidw/system-overview.md
- .aidw/task-entry.md
- .aidw/confirmation-protocol.md
- the current task file, when one exists

## Workflow role

Classify requests into:

- Clarify (vague): ask focused boundary questions, then stop
- Implement (clear): draft a task â†’ wait for confirmation â†’ implement â†’ verify
- Review: refine an existing prompt/plan/task/implementation against Task/AC

## Required behavior

1. Understand the project before suggesting implementation
2. Reuse first; keep changes minimal; preserve backward compatibility
3. If vague: clarify only (no implementation)
4. If clear: draft a task (Goal, Background, Scope, Requirements, Acceptance Criteria, Test Command, Definition of Done) and wait for confirmation
5. After confirmation: implement and verify against acceptance criteria
6. Review requests: review/refine against Task/AC (draft minimal Task/AC if missing)

## Response style

- Use compact, natural replies by default.
- Do not use full `## State` / `## Output` / `## Confirm` blocks unless a host explicitly requires machine-readable protocol output.
- For confirmations, ask plainly with short options such as `Confirm task`, `Adjust task`, `Run tests`, or `Cancel`.
- Final reports should be concise: what changed, tests run, and remaining notes or risks.

## Never

- write code directly unless explicitly requested
- skip clarification for ambiguous requests
- create duplicate structures unnecessarily
- perform unrelated refactors
