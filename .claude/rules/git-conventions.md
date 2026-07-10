<!-- Applies to all git activity. Every commit is production-ready: tests pass, lint clean,
     build green. CI runs lint + test + build + audit on every commit. -->

# Git Conventions

## Golden Rules

- **Every commit is deployable.** If something breaks, revert one commit.
- **One logical change per commit.** If the description needs "and", split the commit.
- Never `--no-verify` unless the human explicitly asks. Never force-push to `main`.

## Commit Message Format

```
type(scope): description in English, imperative mood, no trailing period
```

- **Description:** imperative, lowercase start, ≤ 72 chars, no trailing period.
- **Scope** maps to a feature or layer: `auth`, `register`, `login`, `divisions`, `exercises`,
  `sets`, `core`, `shared`, `ci`.
- **Examples from this repo:** `feat(auth): add login form` · `fix(register): handle 409 email-taken` ·
  `refactor(register): collapse four regex fields into passwordRules array`.

## Semantic Types

| Type | When to use |
|---|---|
| `feat` | new user- or system-visible feature |
| `fix` | bug correction — changes observable behavior |
| `refactor` | internal restructuring; no behavior change |
| `test` | adding/correcting tests; no production change |
| `style` | formatting/whitespace; zero logic change |
| `docs` | documentation only (README, rule files, design docs) |
| `chore` | config, dependencies, build tooling, CI |
| `security` | vulnerability fix or hardening (see `security.md` checklist) |

## AI Commit Protocol (mandatory)

1. **Never commit without explicit human approval.** No speculative `git commit`.
2. **Propose the message first:** `Proposed commit: \`type(scope): description\``
3. **Wait** for "ok" / "confirma" / an alternative message.
4. **Only then** run the commit with the approved message.

No exceptions — not even for "trivial" changes.

## Commit Cadence

Propose a commit at the end of every completed unit of work: after each TDD cycle, each feature slice
(component / service / guard / interceptor / route wired and tested), each green refactor, and each
security hardening or bug fix.

```
feat(divisions): add DivisionsComponent with empty-state template
test(divisions): cover DivisionsComponent render and empty-state
refactor(divisions): extract division-card into standalone dumb component
security(auth): restrict authGuard to same-origin returnUrl paths
```

## Forbidden Git Commands (the AI must refuse, even if asked)

Refuse and explain in one line; the human may run these manually.

| Command | Why forbidden |
|---|---|
| `git push` (any form) | publishes to remote — human decision only |
| `git checkout` / `git switch` | changes working tree and context — human decision |
| `git branch -d` / `-D` | branch deletion is permanent |
| `git reset --hard` | discards uncommitted work without recovery |
| `git rebase` | rewrites history; high blast radius |
| `git merge` | integration point — human decides when branches combine |
| `git commit --amend` | rewrites the previous commit; dangerous if already pushed |
| `git commit --no-verify` | bypasses hooks — defeats the safety net |
| `git stash drop` | permanently destroys stashed work |