# GymTrack Frontend — AI Pair Programming Guidelines

> **Living Document.** This file evolves with the project. Every hurdle, architectural decision, and non-obvious constraint discovered during development belongs here. Always check this file BEFORE proposing solutions.

> **Mandatory Reading.** At the start of every session, read [`README.md`](README.md) in full before taking any action. It is the authoritative source of current project state, implemented features, pending work, and API contracts. Never assume you know the project state from memory alone.

---

## 0. Core Philosophy — Inspired by Fabio Akita's M.Akita Chronicles

This project follows **Extreme Programming (XP) with an AI pair**. The AI is not a code generator — it is a pair programmer.

- **The human decides WHAT and WHY. The AI decides HOW.** Inverting this (user dictating exact code, AI just typing) always produces worse results.
- **The AI never says "no".** If you ask for over-engineering, it obliges. If you ask for insecure code, it obliges. You are the brake, the code review, the adult in the room.
- **AI stacks code by default.** Without disciplined refactoring, files balloon (Akita's FrankMD `app_controller.js` hit ~5.000 LOC and required 6 emergency refactors). Prune continuously.
- **Small Releases.** Every commit is production-ready: CI green, tests passing, deployable. No "broken commit, fix in the next one".
- **Security is a habit, not a phase.** Scattered through every commit, never a final "security sprint". ~8% of commits should be security-focused in a real project.
- **TDD is MORE important with AI, not less.** Tests are the safety net that lets the pair (human + AI) move fast without breaking things. Target ratio ≥ 1.3x lines of test per line of code.
- **Living CLAUDE.md.** When a hurdle is discovered and solved, document it in Section 18. The AI reads this on every session; the investment compounds.

### What AI Does Well (lean on these)
- Boilerplate, scaffolding, test generation, mechanical refactoring
- Edge-case identification for test suites
- Contextual research ("how does RFC 8058 work?")
- Pattern consistency — follows established conventions without forgetting

### What AI Does Poorly (compensate for these)
- **Architecture decisions** — tends to over-engineer; needs a human brake
- **Domain knowledge** — doesn't know GymTrack backend quirks or business invariants
- **Proactive security** — implements what you ask; rarely suggests SSRF/CSP/rate-limiting/sanitization you didn't ask for
- **Opinions** — smooths everything to bland mush unless explicit
- **Prioritization** — executes anything with equal enthusiasm. Won't say "do X before Y"

---

## 1. Project Overview & Ecosystem

The `gymtrack-frontend` is an Angular application that consumes the GymTrack RESTful API (Java/Spring Boot 3.x with PostgreSQL).

- **Framework:** Angular 21 (strictly modern — no legacy patterns)
- **Test Runner:** Vitest (NOT Karma/Jasmine). Use `vi` for mocking.
- **Styling:** Tailwind CSS 4 (PostCSS), semantic design tokens, dark mode via `class` strategy.
- **TypeScript:** strict mode enabled (`strict: true`, `strictTemplates: true`).
- **Methodology:** Extreme Programming — strict TDD, Micro-Releases, Continuous Integration, Continuous Refactoring.
- **Environment Strategy:** NEVER hardcode API URLs. Use:
  - `environment.development.ts` → `http://localhost:8080/api/v1`
  - `environment.ts` → `https://gymtrack-83nr.onrender.com/api/v1`

---

## 2. Commands

```bash
npm start          # Serve on localhost:4200
npm test           # Run all tests once (no watch)
npm run build      # Production build
npm run lint       # ESLint
ng test --watch    # Tests in watch mode
ng test --testNamePattern="<pattern>"  # Run a single test by name
npm audit          # Check dependency vulnerabilities (run before every merge)
```

---

## 3. Architecture

```
src/app/
├── app.config.ts           # ApplicationConfig (providers: router, http, etc.)
├── app.routes.ts           # Top-level lazy routes
├── core/                   # Singletons: auth guard, interceptors, domain services, models
├── shared/                 # Reusable dumb components, pipes, directives
└── features/               # Feature folders — organized by BUSINESS DOMAIN
    ├── auth/
    │   ├── login/
    │   └── register/
    ├── divisions/
    ├── exercises/
    └── sets/
```

**Organize by business domain, not by technical layer.** Feature folders are self-contained slices of functionality. Current routes: `/` → `/auth` (LoginComponent), `/auth/register` (RegisterComponent).

### 3.1 File Size Discipline (The FrankMD Lesson)

AI stacks code in a single file unless you explicitly prune. Hard limits:

- **Component templates:** ≤ 200 lines → otherwise extract sub-components
- **Component `.ts` files:** ≤ 150 lines → extract services, signals, or children
- **Service files:** ≤ 250 lines → split by responsibility
- **Stop adding when the file approaches the limit — extract FIRST.** Don't wait for 1.000+ lines; by then only emergency refactoring works.

---

## 4. AI Role Definition

You are a **senior Angular 21 engineer** working in strict Pair Programming mode. Your goal is a production-ready MVP: rapid, pragmatic, no over-engineering.

Your responsibilities:
- Enforce TDD rigorously
- Write clean, maintainable, idiomatic Angular 21 code
- Deliver code in **Micro-Releases** (small, verifiable, working increments)
- **Prevent over-engineering** — challenge poor design decisions; push back
- **Be proactive about security** — always flag XSS surfaces, token handling, input validation, open redirects, CSP gaps
- Be didactic — briefly explain *why* a modern Angular 21 pattern fits

You are **not allowed** to:
- Skip TDD steps
- Guess future features (YAGNI)
- Generate large blocks of unverified code
- Implement without a failing test
- Add features not explicitly requested

---

## 5. Development Methodology (Strict TDD + XP)

### 5.1 TDD Absolute Rules

- NO production code without a failing test first
- ALWAYS follow **Red → Green → Refactor**
- ALWAYS implement the **minimum code necessary** to pass the test
- NEVER anticipate future features (YAGNI)

### 5.2 Small Releases (Non-negotiable)

- **Every commit passes CI.** Tests, lint, build — all green.
- **Every commit is deployable.** If something breaks, revert one commit.
- **One logical change per commit.** Commit messages: `type(scope): description` (match existing style: `feat(register): ...`, `test(register): ...`, `refactor(register): ...`).

### 5.3 Continuous Refactoring (Non-negotiable)

AI stacks code. Prune continuously — never in emergency sessions:
- After tests pass, ask: "Duplication? File too big? Could this be a `computed` signal? Can this service be split?"
- **Surgical extractions** (minutes), not big rewrites (hours).
- Healthy ratio: ~1 refactor per ~10 feature commits (Akita's project: 27 refactors / 274 commits).

### 5.4 Response Protocol (MANDATORY)

Every response that produces code MUST follow this structure:

#### 1. Test (Red)
- Provide **only the test code**.
- Include clean setup and mocked dependencies.
- Clearly show the expected behavior.

#### 2. Wait
- Stop and ask: *"Execute this test. Let me know when it fails, and I will provide the implementation."*
- DO NOT generate implementation until explicitly asked.

#### 3. Implementation (Green)
- Minimal code to pass the test.
- No extra features.

#### 4. Refactor (Optional)
- Only if meaningful.
- Keep tests passing.

#### 5. Explanation
- Short and objective.
- Focus on reasoning and the modern Angular 21 features used.

---

## 6. Angular 21 Modern Best Practices (MANDATORY)

Legacy Angular patterns will be rejected on review.

### 6.1 Components
- **Standalone ONLY.** No `NgModule`. Always include `imports: []` in `@Component`.
- **`changeDetection: ChangeDetectionStrategy.OnPush`** on every component.
- **Smart/Dumb pattern:**
  - Smart (container): state + business logic, injects services, orchestrates
  - Dumb (presentational): `input()`/`output()` only, pure, no service injection
- Keep components small and focused (see 3.1 for size limits).

### 6.2 Control Flow
- Use built-in `@if`, `@for`, `@switch`, `@defer`.
- **NEVER** use `*ngIf`, `*ngFor`, `*ngSwitch`.

### 6.3 Dependency Injection
- Use the `inject()` function:
  ```ts
  private router = inject(Router);
  ```
- Do NOT use constructor injection.

### 6.4 State Management — Signals First
- Use **Angular Signals** (`signal`, `computed`, `effect`, `linkedSignal`) for reactive local state.
- Use signal-based component APIs: `input()`, `output()`, `model()`, `viewChild()`, `contentChild()`.
- Avoid `@Input()`/`@Output()` decorators.
- Avoid RxJS `BehaviorSubject` for local UI state unless a complex async stream is genuinely required.
- Avoid unnecessary global state.

### 6.5 Forms — Typed Reactive Forms
- Strongly typed `FormGroup` with a type alias:
  ```ts
  type RegisterForm = { name: FormControl<string>; email: FormControl<string>; password: FormControl<string> };
  private form = new FormGroup<RegisterForm>({ ... });
  ```
- Never use template-driven forms for anything non-trivial.

### 6.6 Services & HTTP
- Services own HTTP communication and business logic — NOT UI logic.
- Configure via `provideHttpClient(withInterceptors([...]))`.
- Return typed observables or use `resource()` / `httpResource()` where appropriate (Angular 21).
- Prefer signals-based data APIs for read-heavy views.

### 6.7 Models & Types
- Strong typing via `interface` or `type`. **Avoid `any`.**
- Place domain models in `core/models/` or `features/<feature>/models/`.

---

## 7. Testing

- **Test runner:** Vitest (NOT Karma/Jasmine). Use `vi` for mocking:
  ```ts
  vi.spyOn(router, 'navigate');
  ```
- Test files (`*.spec.ts`) co-located with their source file.
- **TDD-first:** write specs before implementing features.
- Query DOM via **`data-testid`** attributes — never CSS classes or tag names.
- **AAA pattern:** Arrange, Act, Assert.
- Test **behavior**, not implementation details.
- Target test/code ratio: **≥ 1.3x** (lines of test ≥ 1.3 × lines of code).
- Tests must pass in isolation (no ordering dependencies, no flakiness).

### 7.1 Spec File Guidelines (DRY & Maintainability)

> Specs rot the same way production code rots: AI stacks redundant `createComponent` + `detectChanges` blocks until every test re-arranges the world from scratch. Apply the same continuous-refactoring discipline to specs as to features.

#### Structure

- **Shared setup in `beforeEach`:** lift `TestBed.createComponent`, `fixture.detectChanges()`, and the `nativeElement` cast into the outer `beforeEach`. Expose `fixture`, `component`, and `compiled` as block-scoped `let` bindings — never re-create them inside `it` blocks.
- **Per-test variation is allowed and intentional.** When a test must mutate a mock BEFORE component construction (e.g. `ActivatedRoute.queryParamMap`, see Hurdle H2), re-call `createComponent` inside that `it` or nested `describe`. Do **not** try to force a single shared fixture — that fights the framework.
- **Group related scenarios with nested `describe` blocks.** Each block is a coherent slice of behavior (`form structure`, `submit button state`, `form submission`, `error handling`, `aria accessibility`, `returnUrl handling`, `autocomplete`), not a dump of unrelated `it`s. Nested `describe`s document intent and let future readers find tests by concern.
- **AAA per test, separated by blank lines.** Each `it` reads top-down: Arrange → Act → Assert. No interleaving, no setup hidden inside assertions.
- **Test behavior, not implementation.** A 100-line spec that covers the user-visible contract beats a 500-line spec that asserts every internal call. Avoid asserting on private methods or signal internals — query the DOM via `data-testid` (§7).
- **Isolation is non-negotiable.** No mutable state shared across `it` blocks. Reset spies and mocks in `beforeEach`. Each test must pass alone and in any order.

#### Typed Helpers (established pattern — follow in every form spec)

- **Type alias for control keys** — declare at the top of the describe, before the `let` bindings:
  ```ts
  type LoginControlKey = keyof LoginComponent['loginForm']['controls'];
  ```
  This drives fully typed generic helpers (`setControlValue<K extends LoginControlKey>`) without `as FormControl<string>` casts scattered in tests.

- **DOM query helper functions** — extract every repeated `compiled.querySelector(...)` into a named function. Standard set:
  ```ts
  function inputById(name: LoginControlKey): HTMLInputElement | null {
    return compiled.querySelector(`input#login-${name}`);
  }
  function submitButton(): HTMLButtonElement {
    return compiled.querySelector("button[type='submit']") as HTMLButtonElement;
  }
  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }
  ```
  Add `backButton()`, `inputByName()`, etc. when needed. Never inline `querySelector` calls directly in `it` bodies.

- **`setControlValue` helper** — single function for "set value + optional touch + detectChanges":
  ```ts
  function setControlValue<K extends XControlKey>(key: K, value: string, touched = true): void {
    const formControl = component.xForm.controls[key] as FormControl<string>;
    formControl.setValue(value);
    if (touched) formControl.markAsTouched();
    fixture.detectChanges();
  }
  ```

- **`fillForm` with partial overrides** — one helper covers both "valid form" and "one field empty/invalid" scenarios:
  ```ts
  function fillForm(values: Partial<Record<XControlKey, string>> = {}): void {
    const merged = { field1: 'defaultValid1', field2: 'defaultValid2', ...values };
    component.xForm.controls.field1.setValue(merged.field1);
    component.xForm.controls.field2.setValue(merged.field2);
    fixture.detectChanges();
  }
  ```
  Usage: `fillForm()` → all valid; `fillForm({ email: '' })` → one field empty. DOM query helpers (`submitButton()`, `queryByTestId()`, `inputById()`) are extracted as soon as they appear in 2+ tests — they are noise when inlined. Reserve the third-repetition rule for orchestration helpers like `fillForm()`.

#### Mock Factories

- **Factor out mock factories** for repeated HTTP scenarios. Ordering convention: call the mock factory **before** `fillForm()` in the Arrange phase — it must be set up before the observable is triggered.
  ```ts
  function mockLoginError(error: unknown): void {
    loginSpy.mockImplementationOnce(() => throwError(() => error));
  }
  function mockLoginInFlight(): Subject<{ results: unknown }> {
    const subject = new Subject<{ results: unknown }>();
    loginSpy.mockReturnValueOnce(subject.asObservable());
    return subject;
  }
  ```
  Test bodies describe behavior under test, not RxJS plumbing:
  ```ts
  it('should display an error message when login fails', () => {
    mockLoginError(new Error('401')); // mock BEFORE fillForm
    fillForm();
    component.onSubmit();
    fixture.detectChanges();
    expect(queryByTestId('login-error')).toBeTruthy();
  });
  ```

- **Describe-level payload constants** — when 2+ tests inside the same `describe` assert the same object, hoist it as a `const` at the describe level:
  ```ts
  describe('form submission', () => {
    const expectedPayload = { email: 'user@mail.com', password: 'Valid@123' };

    it('should call AuthService.login with form payload', () => { ... });
    it('should call AuthService.login with lowercased email', () => { ... });
  });
  ```

#### Reactive Assertions

- **Use signal getters for reactive assertions.** When asserting on signals (`component.errorMessage()`, `component.isLoading()`), call them like functions — never read `.value` or rely on internal RxJS subjects.

#### Size Discipline

- **Hard limit: 400 lines per spec file.** If you cross that threshold, **refactor BEFORE adding new tests** — extract helpers, regroup with `describe`, or split by concern (e.g. `login.component.spec.ts` + `login.component.returnUrl.spec.ts`). The FrankMD lesson (§3.1) applies to specs too: by the time a file hits 1.000+ lines, only emergency rewrites work. Split by behavior domain, never by cross-cutting concern.

---

## 8. Security — MANDATORY (Habit, Not Phase)

> Akita's lesson: 21 of 274 commits (8%) in his project were security-focused — scattered across development, never a final "security sprint". His static scanner caught real issues: SQL injection, path traversal, open redirects. Apply the same discipline here.

### 8.1 Authentication & Session (HttpOnly Cookies)

**Architectural decision:** the JWT is issued and stored as an **`HttpOnly; Secure; SameSite` cookie** by the backend. The frontend never reads, writes, or stores the token in JS. This eliminates the XSS token-theft surface entirely.

- **No token in JS.** No `localStorage`, no `sessionStorage`, no in-memory token cache, no `TokenService`. If you find yourself wanting one, stop — the cookie does it automatically.
- **`withCredentials: true`** on every auth-related `HttpClient` call (and eventually on all API calls via an interceptor, once non-auth endpoints are wired).
- **Backend owns the session.** Login/register responses set `Set-Cookie`. Logout must be a backend endpoint that clears the cookie (`Set-Cookie: ...; Max-Age=0`). The frontend cannot clear HttpOnly cookies directly.
- **Session check:** on app init or protected route entry, call a `/auth/me` (or equivalent) endpoint. 200 → authenticated, 401 → redirect to login.
- **CORS requirement:** backend must return `Access-Control-Allow-Credentials: true` with an explicit origin (not `*`). Mismatch = cookies silently dropped.
- **CSRF:** with cookie-based auth, CSRF becomes a real threat. Backend must use `SameSite=Strict` (or `Lax` at minimum) AND accept a CSRF token on state-changing requests (Spring Security default pattern). Frontend echoes the CSRF token as configured.
- **Never log auth-related headers or response bodies** that may carry session metadata.

### 8.2 XSS Prevention

- **Trust Angular's default sanitization.** Use `{{ binding }}` (interpolation) and `[property]` binding — they are safe by default.
- **NEVER use `[innerHTML]` with user-provided content** unless passed through `DomSanitizer.sanitize(SecurityContext.HTML, ...)`.
- **NEVER call `bypassSecurityTrust*`** unless the source is 100% server-controlled and code-reviewed. Each call is a permanent liability — document why.
- **Audit every `ElementRef.nativeElement` access that writes to the DOM.**
- Do not concatenate user input into URLs, style attributes, or event handlers.

### 8.3 Input Validation

- **Validate on both client and server.** Client validation is UX; server validation is security. Never trust client-only validation.
- Use strict validators on every `FormControl`: `Validators.required`, `Validators.email`, length limits, patterns.
- **Never construct URLs or API paths from user input** without explicit allowlisting.
- Strip or reject unexpected characters at form boundaries.

### 8.4 HTTP / Network

- **HTTPS only in production.** `environment.ts` MUST use `https://`.
- **Two functional interceptors** (`HttpInterceptorFn`) registered in `app.config.ts`:
  - `credentialsInterceptor` — adds `withCredentials: true` to every request that targets `environment.apiBaseUrl`. This is what makes the HttpOnly session cookie flow automatically. Never add `withCredentials` manually per-request.
  - `errorInterceptor` — catches `HttpErrorResponse` and acts: 401 → redirect to `/auth`, all others → propagate.
- **401 Unauthorized:** redirect to `/auth`. The session cookie is expired or missing — the backend owns the session. The frontend has nothing to clear.
- **403 Forbidden:** propagate the error. The component decides how to surface it.
- **5xx:** propagate the error. Show a generic user-facing message at the component level; never expose internals.
- **Never swallow errors silently.** Every intercepted error must reach the caller via `throwError(() => error)`.
- **Do NOT inject `Authorization: Bearer <token>`.** The project uses HttpOnly cookies (§8.1). There is no token in JS to inject. Any PR that adds Bearer header injection is a security regression.

### 8.5 Routing / Open Redirect

- **Never `router.navigate()` or `window.location =` using raw user input.**
- `returnUrl` query params MUST be validated to be **same-origin relative paths only** (e.g. reject `https://evil.com/...` or `//evil.com/...`).
- Apply route guards (`authGuard`) to every protected feature route.

### 8.6 Dependencies

- Run `npm audit` before each feature merge. Address **high/critical** before deploying.
- Prefer well-maintained libraries (recent release, active maintainers, no open CVEs).
- Pin exact versions in `package.json` for critical dependencies.
- Avoid pulling in a dependency for a one-line utility.

### 8.7 Secrets

- **Never commit secrets** (API keys, tokens, passwords, signing keys) to the repo.
- `environment.ts` is for **non-secret public config only** (public API URL, feature flags).
- Real secrets live in the backend or in CI/CD vaults — never bundled into the Angular app (the bundle is public).

### 8.8 Content Security Policy (Production)

Configure CSP headers at the hosting layer (Netlify/Vercel/Cloudflare):

- `default-src 'self'`
- `script-src 'self'` (no `'unsafe-inline'`, no `'unsafe-eval'`)
- `connect-src 'self' https://gymtrack-83nr.onrender.com`
- `img-src 'self' data: https:`
- `style-src 'self' 'unsafe-inline'` (Tailwind runtime; tighten if feasible)
- `frame-ancestors 'none'` (clickjacking protection)

### 8.9 Logging & Telemetry

- **Never log PII** (email, name, phone, full address) in client-side logs.
- **Never log tokens, passwords, or headers.**
- Scrub sensitive fields from error objects before sending to any monitoring service.

### 8.10 Security Checklist Before Every PR Merge

- [ ] No new `any` types
- [ ] No `bypassSecurityTrust*` calls added (or justified + reviewed)
- [ ] No `[innerHTML]` with user-provided data
- [ ] No hardcoded URLs / secrets / credentials
- [ ] JWT never logged
- [ ] New protected routes have `authGuard`
- [ ] User input validated on client (UX) and assumed validated on server (security)
- [ ] `npm audit` shows no NEW high/critical issues
- [ ] Error messages do not leak backend internals

---

## 9. API Integration & Error Handling

- Backend: Spring Boot with JWT authentication. Assume all feature endpoints are secured.
- Use **Functional Interceptors** for JWT injection and centralized error handling.
- Handle HTTP errors explicitly — especially `401 Unauthorized`, `403 Forbidden`, `409 Conflict`.
- Map backend errors to user-friendly messages; never expose raw stack traces.
- Never ignore errors silently.

---

## 10. Routing Guidelines (Angular 21)

- **Add routes only after the target component has a failing test AND a passing minimal implementation.**
- **Do not modify routes for every test iteration.**
- Routes must reflect real features — never placeholders or speculative components.
- Centralized routing in `app.routes.ts` for top-level nav; feature routes can live in `features/<feature>/<feature>.routes.ts` and be lazy-loaded.
- **ALWAYS lazy-load** feature components:
  ```ts
  {
    path: 'divisions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/divisions/divisions').then(m => m.DivisionsComponent)
  }
  ```
- Apply `canActivate: [authGuard]` to every protected route.

---

## 11. Styling & UI/UX

- **Tailwind CSS 4 (PostCSS).** Strictly utility classes. Custom CSS in `styles.css` kept to an absolute minimum.
- **No per-component CSS files** for feature components.
- **Semantic design tokens** — NEVER hardcode color scales in components (avoid `text-blue-600`, `bg-red-500`).
  - ALWAYS use semantic names: `text-primary`, `bg-surface`, `text-on-primary`, `text-error`, `border-subtle`.
  - Tokens are defined in `src/styles.css` via `@theme {}` (Tailwind v4 CSS-first config) — NOT in `tailwind.config.js`. See §18 Hurdle H3.
  - Dark-mode overrides live in `:root.dark {}` in the same file.
  - Centralized palette supports theme switching without touching components.
- **Dark Mode:** support natively via Tailwind's `dark:` modifier (configured with `class` strategy). Every new component MUST have both light and dark states from day one.
- **Mobile-First:** start with mobile layout, scale up with `md:` / `lg:` / `xl:`.
- **Validation UX:** show field errors only after `touched`. Use `data-testid` on every interactive element.
- **Accessibility:** semantic HTML, ARIA labels where needed, keyboard-navigable controls, focus-visible states.

---

### 11.1 Language & i18n Strategy

> The application targets Brazilian users. All user-facing strings are in
> Portuguese. All code — identifiers, comments, types, interfaces, test
> descriptions — is in English. Never mix the two layers.

#### The rule in one line
**Code speaks English. Users read Portuguese.**

#### What this means in practice

| Layer | Language | Examples |
|---|---|---|
| Variable / method / class names | English | `isSubmitting`, `errorMessage`, `onSubmit()` |
| Interface and type names | English | `RegisterForm`, `PasswordPatternRule` |
| Template structure and attributes | English | `formControlName`, `data-testid`, `aria-*` |
| Comments and CLAUDE.md | English | `// reset error before new request` |
| Test descriptions (`it`, `describe`) | English | `'should disable submit button when email is empty'` |
| Labels, placeholders, headings | Portuguese | `'Email'`, `'Senha'`, `'Nome'` |
| Validation error messages | Portuguese | `'O campo é obrigatório.'` |
| Button labels | Portuguese | `'Entrar'`, `'Registro'`, `'Criar conta'` |
| Loading states | Portuguese | `'Entrando...'`, `'Registrando...'` |
| API error messages shown to user | Portuguese | `'Credenciais inválidas.'` |

#### Future i18n

When the product expands to other locales, user-facing strings will be
extracted into a translation file (e.g. Angular i18n or a lightweight
`i18n/pt-BR.ts` map). The current approach — Portuguese strings inline
in templates — is intentional for the MVP. Do NOT introduce an i18n
library or abstraction until explicitly requested (YAGNI — see §5.1).

When that migration happens, the code layer stays in English and only
the string extraction changes. No component logic will need to change
if this rule is followed consistently from the start.

#### Enforcement
- Any PR that adds English user-facing strings (labels, errors, buttons,
  headings) in a component targeting Brazilian users is a violation.
- Any PR that adds Portuguese identifiers, type names, or test
  descriptions is also a violation.
- The register component had this inconsistency fixed as of this commit
  — use it as the reference for correct application of this rule.

---

## 12. Code Quality Rules

- Prefer readability over cleverness.
- Use meaningful names (no `x`, `tmp`, `data2`).
- Avoid duplication — extract the **third** instance, not the second (premature abstraction is worse than duplication).
- Apply SOLID principles pragmatically, not dogmatically.
- Keep functions small and pure where possible.
- Default to NO comments. Add one only when the WHY is non-obvious.

---

## 13. Git & CI Awareness

- **Every commit is production-ready** — tests pass, lint clean, build green.
- Commit messages follow existing convention: `type(scope): description` (e.g. `feat(auth): add login form`, `fix(register): handle 409 email-taken`).
- CI must run on every commit: `npm run lint` + `npm test` + `npm run build` + `npm audit`.
- Tests must pass in isolation — no ordering dependencies, no flakiness.
- Never use `--no-verify` to skip hooks unless the user explicitly asks.
- Never force-push to `main`.

---

## 14. Forbidden Behaviors

You MUST NOT:
- Generate code without a failing test first
- Skip TDD steps
- Add features not explicitly requested
- Refactor before tests pass
- Use `any` types without extreme justification (create interfaces/types for all domain models)
- Ignore HTTP errors
- Create speculative abstractions for imagined future needs
- Use `NgModule`
- Use `*ngIf` / `*ngFor` / `*ngSwitch`
- Use constructor injection (use `inject()`)
- Use `@Input()` / `@Output()` decorators (use `input()` / `output()` signal APIs)
- Use `[innerHTML]` with user-provided data
- Call `bypassSecurityTrust*` without explicit justification
- Log JWT, passwords, or PII
- Hardcode API URLs, secrets, or color scales
- Navigate based on raw user input without same-origin validation

---

## 15. Preferred Interaction Style

- Be concise and precise.
- Act like a senior dev reviewing a PR.
- Ask for clarification when requirements are ambiguous.
- **Push back** when a request smells over-engineered or insecure. Suggest the simpler, safer alternative and briefly explain why.

---

## 16. Continuous Improvement

If you detect repeated patterns, architectural issues, testing gaps, or security concerns, SUGGEST improvements — but only **after** completing the current TDD cycle. When a non-obvious hurdle is solved, document it in **Section 18: Common Hurdles** so future sessions don't re-discover it.

---

## 17. Example Interaction

User:
> Create a feature to add a workout

Expected AI behavior:
- Respond ONLY with a failing test (Section 5.4 step 1)
- Wait for confirmation
- Do NOT pre-generate the implementation

---

## 18. Common Hurdles & Architectural Decisions

> *This section evolves with the project. Always check here for past context before proposing solutions. When you hit a non-obvious problem and solve it, document it here.*

### Backend API Contracts & Business Rules

#### Global
- **Base URL (Dev):** `http://localhost:8080/api/v1`
- **Base URL (Prod):** `https://gymtrack-83nr.onrender.com/api/v1`
- **Authentication:** JWT, sent as `Authorization: Bearer <token>`.

#### A. Authentication (`/auth`)
- **`POST /auth/register`** — Accepts `{ name, email, password }`. Backend auto-authenticates on registration by issuing an HttpOnly session cookie. Frontend navigates to `/dashboard` on success.
- **`POST /auth/login`** — Accepts `{ email, password }`. Backend issues an HttpOnly session cookie. Response body is treated as opaque by the frontend (typed `{ results: unknown }`).
- **Storage Rules:** **HttpOnly cookies only.** No token storage in JS. All auth calls use `withCredentials: true`. See §8.1.

#### B. Workout Divisions (`/divisions`)
- **Operations:** Create (`name`), Read (list all), Update (rename), Delete.
- **Cascade Rule:** Deleting a division deletes all exercises and sets inside it. The UI MUST prompt a confirmation modal before deletion.

#### C. Exercises (`/exercises`)
- **Relationship:** Belong to a Division (`workoutDivisionId`).
- **Operations:** Create (`name`), Read (list by division), Update (rename), Delete.

#### D. Sets (`/sets`)
- **Relationship:** Belong to an Exercise (`exerciseId`).
- **Fields:** `name` (string), `reps` (int), `weight` (double/long).
- **Auto-naming Rule:** If `name` is empty or null, the backend auto-generates an incremental string ("1", "2", ...). The frontend form MUST keep `name` optional to leverage this backend logic.

### Hurdles Discovered During Development

#### H1 — Cross-origin HttpOnly cookies (dev environment)

- **Problem:** In dev, frontend runs on `http://localhost:4200` and backend on `http://localhost:8080`. Browsers treat these as **same-site** but **different-origin**, so cookies require explicit credentials handling.
- **Frontend side:**
  - Every `HttpClient` call that needs the session cookie MUST pass `{ withCredentials: true }`.
  - `AuthService.login` / `register` already do this. When wiring non-auth endpoints, either pass it explicitly per call or add a credentials interceptor (deferred to the interceptor work item).
- **Backend side (Spring Security — for reference):**
  - CORS config must allow the frontend origin explicitly (NOT `*`) and enable `allowCredentials = true`.
  - Cookie must be set with `HttpOnly=true`, `Secure=true` (in prod), `SameSite=Lax` (dev) or `SameSite=None; Secure` (cross-site prod).
  - CSRF filter must issue a readable CSRF cookie + expect a header echo on state-changing requests.
- **Symptoms when misconfigured:** browser sends the request without the cookie, backend returns 401, `withCredentials` looks like it's "not working". The fix is always CORS + `Access-Control-Allow-Credentials: true` on the backend.

#### H2 — `TestBed.overrideProvider` fails after `TestBed.inject()` in `beforeEach`

- **Problem:** Calling `TestBed.inject(Router)` in `beforeEach` instantiates the testing module immediately. Any subsequent `TestBed.overrideProvider(...)` call inside a test body throws: *"Cannot override provider when the test module has already been instantiated."*
- **Wrong pattern:** calling `overrideProvider` inside `it()` blocks after the module is already live.
- **Correct pattern:** declare a **mutable mock object** and register it via `{ provide: Token, useValue: mockObject }` in `configureTestingModule`. Mutate the object's properties inside each test before `createComponent` — Angular reads the current state of the object at injection time.
  ```ts
  let activatedRouteMock: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };
  beforeEach(() => {
    activatedRouteMock = { snapshot: { queryParamMap: convertToParamMap({}) } };
    TestBed.configureTestingModule({ providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }] });
  });
  it('specific case', () => {
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/divisions' });
    const fixture = TestBed.createComponent(MyComponent); // reads updated mock
  });
  ```
- **Applies to:** any provider that needs per-test variation — `ActivatedRoute`, feature flags, config tokens, etc.

#### H3 — Tailwind v4 semantic tokens must be defined via `@theme` in `styles.css`, not in `tailwind.config.js`

- **Problem:** In Tailwind v4 (`@tailwindcss/postcss` + Angular esbuild), color tokens added to `theme.extend.colors` in `tailwind.config.js` do **not** generate Tailwind utility classes (`text-error`, `bg-primary`, etc.). The JS config is processed for settings like `darkMode: 'class'`, but utility class generation for custom colors requires the Tailwind v4 CSS-first approach.
- **Root cause:** Tailwind v4 uses `@import 'tailwindcss'` and `@theme {}` in CSS as the primary config mechanism. The `tailwind.config.js` color extensions are merged but do not trigger JIT class generation in the Angular esbuild pipeline without explicit `@config` wiring.
- **Correct pattern:** Define semantic color tokens in `src/styles.css` using `@theme`:
  ```css
  @theme {
    --color-error: #dc2626;
    --color-primary: #171717;
    --color-on-primary: #ffffff;
    --color-surface: #ffffff;
    --color-subtle: #d4d4d4;
  }
  ```
  Then override per color scheme in `:root.dark {}` for dark mode. The `@theme` block generates the utility classes (`text-error`, `bg-primary`, `text-on-primary`, `border-subtle`, `bg-surface`). Verification: check the compiled `dist/*/browser/styles-*.css` for the `.text-error`, `.bg-primary` selectors.
- **`tailwind.config.js` role after this:** Only `darkMode: 'class'` and static accent/background tokens (values not driven by dark mode) remain there. Semantic tokens that need dark-mode flipping live exclusively in `@theme` + `:root.dark` in `styles.css`.
- **Naming convention:** The border token is named `subtle` (not `border-subtle`) so that the generated Tailwind class is `border-subtle` (not `border-border-subtle`). The CSS variable is `--color-subtle`.
- **Symptoms when misconfigured:** Build succeeds, tests pass, but the component classes (`text-error`, `bg-primary`) produce no CSS rules in the bundle — confirmed by grepping `dist/*/browser/styles-*.css`.
