# GymTrack Frontend — AI Pair Programming Guide

Angular 21 SPA that consumes the GymTrack REST API (Java / Spring Boot 3.x + PostgreSQL).
Built with Extreme Programming: strict TDD, micro-releases, continuous refactoring.

> **Read `README.md` first, every session.** It is the source of truth for current
> project state, implemented features, pending work, and API contracts. Never rely
> on memory alone for project state.

<!-- Detailed rules live in .claude/rules/ and load automatically — no import needed.
     This root file is the lean index: identity, stack, commands, architecture, and
     how we work. Keep it under 200 lines. When a section grows, move it to a rule file. -->

## How We Work (non-negotiable)

- **The human decides WHAT and WHY. The AI decides HOW.** The human is the code review and the brake.
- **TDD always: Red → Green → Refactor.** No production code without a failing test first.
- **Minimum code to pass the test.** No speculative features (YAGNI).
- **Small releases.** Every commit is deployable: tests, lint, and build all green.
- **Prune continuously.** The AI stacks code; extract BEFORE files reach the size limits below.
- **Push back** on over-engineered or insecure requests; propose the simpler, safer path and say why.
- **Be concise and precise** — respond like a senior dev reviewing a PR. Ask for clarification when a request is genuinely ambiguous rather than guessing.

### TDD Response Protocol (every response that produces code follows this)

1. **Test (Red)** — provide only the failing test, with clean setup and mocked dependencies.
2. **Wait** — ask the human to run it. Do NOT write the implementation yet.
3. **Green** — the minimum code to pass. Nothing extra.
4. **Refactor** — only if meaningful, keeping tests green.
5. **Explain** — short, focused on the Angular 21 pattern used.

## Stack

- **Framework:** Angular 21 — standalone components only, no `NgModule`, `OnPush` change detection.
- **Tests:** Vitest (not Karma/Jasmine). Mock with `vi`.
- **Styling:** Tailwind CSS 4 (PostCSS), semantic design tokens, dark mode via `class` strategy.
- **TypeScript:** strict mode (`strict`, `strictTemplates`). Avoid `any`.
- **Auth:** HttpOnly session cookie issued by the backend. **No token in JS.** See `security.md`.
- **API URLs:** never hardcode. Use `environment.development.ts` (`http://localhost:8080/api/v1`)
  and `environment.ts` (`https://gymtrack-83nr.onrender.com/api/v1`).

## Commands

```bash
npm start     # serve on localhost:4200
npm test      # run all tests once (no watch)
npm run build # production build
npm run lint  # ESLint
npm audit     # dependency vulnerabilities — run before every merge
ng test --watch                          # tests in watch mode
ng test --testNamePattern="<pattern>"    # run a single test by name
```

## Architecture

Organize by **business domain**, not by technical layer. Feature folders are
self-contained slices of functionality.

```
src/app/
├── app.config.ts     # ApplicationConfig providers: router, http, interceptors
├── app.routes.ts     # top-level lazy routes
├── core/             # singletons: guards, interceptors, domain services, models
├── shared/           # reusable dumb components, pipes, directives
└── features/         # domain slices: auth, divisions, exercises, sets
```

**File-size limits — extract BEFORE hitting them, never wait for an emergency rewrite:**
component template ≤ 200 lines · component `.ts` ≤ 150 · service ≤ 250 · spec file ≤ 400.

## Code Quality

- Prefer readability over cleverness. Use meaningful names (no `x`, `tmp`, `data2`).
- Extract on the **third** repetition, not the second — premature abstraction is worse than duplication.
- Apply SOLID pragmatically, not dogmatically. Keep functions small and pure where possible.
- Default to **no comments**; add one only when the WHY is non-obvious.

## Detailed Rules (in `.claude/rules/`, all loaded automatically)

| File | Covers |
|---|---|
| `security.md` | auth (HttpOnly cookies), XSS, input validation, interceptors, CSP, pre-PR checklist |
| `angular-patterns.md` | signals, control flow, `inject()`, typed reactive forms, services & HTTP |
| `testing.md` | Vitest, AAA, spec helpers, mock factories, size discipline |
| `ui-styling.md` | Tailwind semantic tokens, dark mode, PT-BR / EN i18n rule |
| `git-conventions.md` | commit format, commit cadence, forbidden git commands |
| `api-contracts.md` | backend endpoints, business rules, dev hurdles |

**Keep the rules alive.** When you solve a non-obvious hurdle, document it in the matching rule
file so the investment compounds (a testing quirk → `testing.md`, a Tailwind quirk → `ui-styling.md`,
an auth/CORS quirk → `security.md`). Suggest improvements only **after** the current TDD cycle is green,
never mid-cycle.

> Rules are intentionally **not** path-scoped. This is a solo TDD project that creates
> new files constantly, and scoped rules only load when Claude *reads* an existing
> matching file — never at creation time. Keeping every rule always-loaded guarantees
> the rule is present when a new spec or component is written. Revisit only if context
> pressure ever becomes a real problem (it won't at this size).

## Hard Nos (full detail lives in the rule files)

- No `NgModule`; no `*ngIf` / `*ngFor` / `*ngSwitch` (use `@if` / `@for` / `@switch`).
- No constructor injection (use `inject()`); no `@Input()` / `@Output()` decorators (use `input()` / `output()`).
- No `any` without strong justification. No `[innerHTML]` with user data. No `bypassSecurityTrust*` unjustified.
- No token in JS, no `Authorization: Bearer` header — auth is **HttpOnly cookies only**.
- No hardcoded API URLs, secrets, or color scales. No navigation based on raw user input.