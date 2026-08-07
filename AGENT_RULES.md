# AGENT_RULES.md -- Single Entry Point for ui-extractor Agents

> **Owner**: stsgs1980
> **Target**: ui-extractor v0.1.0
> **Status**: ACTIVE
> **Last Updated**: 2026-08-07

This file is the single orchestration entry point for any agent operating in ui-extractor. If you read only one file at session start, read this one.

---

## 1. Onboarding Protocol (run at session start)

Sequential. Each step depends on the previous.

```
Step 1. Read this file (AGENT_RULES.md)
Step 2. Read README.md
Step 3. Read docs/agent-workflow.md
Step 4. Read docs/teardown-method.md
Step 5. Run sanity verifier: pnpm eslint .
```

---

## 2. Priority Order (Conflict Resolution)

When two sources disagree, the higher one wins.

```
Priority 1 (highest)  Standards (STD-DOC-002, STD-DOC-003, STD-DOC-004)
Priority 2            ESLint rules (eslint.config.js + custom rules)
Priority 3            AGENT_RULES.md (this file)
Priority 4 (lowest)   Skills (if any)
```

---

## 3. Prohibitions

What agents must never do:

<!-- RULE-ANSWER-001: Answer before act -->
- Do not start work without confirming the task (Question -> ANSWER, Task -> EXECUTE)

<!-- RULE-READ-003: Read before write -->
- Do not edit a file you have not read first

<!-- RULE-COMMIT-014: Pre-commit checklist -->
- Do not commit without running `pnpm eslint .` and verifying 0 errors

<!-- RULE-DOC-010: Doc sync -->
- Do not commit code without updating corresponding documentation

<!-- STD-DOC-003: Unicode Policy -->
- Do not use emoji or Unicode graphics in code, documentation, or chat
- Use text tags like [OK], [FAIL], [TODO], [WARNING], [INFO] instead

<!-- STD-DOC-002: Markdown Standard -->
- Do not use `---` separators between sections
- Do not use Unicode box-drawing for trees or tables
- Code blocks MUST specify a language

- Do not push to upstream repos without approval
- Do not modify standards without PR
- Do not skip pre-commit checks
- Do not commit directly to main without verification

---

## 4. Rule Registry

This project uses ESLint with custom rules for enforcement:

| Rule | Severity | Standard | Description |
|------|----------|----------|-------------|
| `unicode-policy/emoji` | error | STD-DOC-003 | No emoji in source code |
| `unicode-policy/unicode-graphics` | error | STD-DOC-003 | No Unicode box/line drawing in source code |
| `unicode-policy/emoji-in-md` | error | STD-DOC-003 | No emoji in Markdown documentation |
| `unicode-policy/unicode-graphics-in-md` | error | STD-DOC-003 | No Unicode graphics in Markdown documentation |
| `code-block-language/require-language` | error | STD-DOC-002 | Code blocks must specify a language |
| `no-irregular-whitespace` | error | STD-DOC-002 | No NBSP, ZWSP, etc. |
| `no-unused-vars` | warn | — | Warn on unused vars (allow _ prefix) |

Run all checks:
```bash
pnpm eslint .
```

---

## 5. Skill Catalog

This project does not define custom agent skills. The following external capabilities are available via MCP:

| Tool | Description |
|------|-------------|
| `uix_pipeline` | Full pipeline: extract + analyze + spec + generate |
| `uix_extract` | Extract UI data from URL |
| `uix_analyze` | Analyze patterns and design system |
| `uix_spec` | Generate component specification |
| `uix_generate` | Generate component code |
| `uix_learn` | Learn and save reference |
| `uix_references` | List references |
| `uix_generate_from_reference` | Generate from saved reference |
| `uix_compare` | Compare two URLs |

---

## 6. Verifiers

Run at session start:

```bash
# Lint check (must pass with 0 errors)
pnpm eslint .

# Type check (if TypeScript)
pnpm typecheck
```

---

## 7. Anti-patterns

- [FAIL] Multiple entry points (agent confused about what to read)
- [FAIL] Missing priority order (conflicts unresolved)
- [FAIL] No prohibitions (agent does dangerous things)
- [FAIL] Using emoji instead of text tags
- [FAIL] Mixing languages within same file
- [FAIL] Editing files without reading them first
- [FAIL] Committing without lint verification