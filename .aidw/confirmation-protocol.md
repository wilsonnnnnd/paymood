# AI Execution Confirmation Protocol

This repository uses confirmation gates for safety, but does not require a rigid
response template.

## Default Output Style

- Use compact, natural replies by default.
- Prefer short sections such as `Plan`, `Changed`, `Tests`, and `Notes` only
  when they make the answer easier to scan.
- Do not output full `## State` / `## Output` / `## Confirm` blocks unless a
  host integration explicitly requires machine-readable protocol fields.
- Keep confirmations lightweight: ask the user to confirm the task, test run, or
  risky action in plain language.

## Workflow

1. Clarify vague requests with focused boundary questions, then stop.
2. For clear implementation requests, draft a concise task and wait for user
   confirmation before editing files.
3. After confirmation, implement the smallest safe change.
4. Ask before running tests when the environment or task protocol requires it;
   otherwise run the agreed test command and report the result.
5. For review requests, lead with findings and ground them in files/lines.

## Safety Gates

- Before task confirmation:
  - Do not edit files.
  - Do not run test/build commands.
- Before test confirmation:
  - Do not run tests if the user has not approved the proposed command.
- For destructive actions, external side effects, dependency changes, protected
  areas, or unclear scope, ask first.

## Confirmation Prompts

Use concise choices when helpful:

- `Confirm task`
- `Adjust task`
- `Run tests`
- `Skip tests`
- `Cancel`

Plain text confirmation from the user is sufficient.
