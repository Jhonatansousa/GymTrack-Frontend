<!-- Applies to Angular source (src/app/**/*.ts and templates). Legacy Angular patterns
     are rejected on review. Be didactic: briefly explain WHY a modern pattern fits. -->

# Angular 21 Patterns (mandatory)

## Components

- **Standalone only.** No `NgModule`. Always include `imports: []` in `@Component`.
- **`changeDetection: ChangeDetectionStrategy.OnPush`** on every component.
- **Smart / Dumb split:**
  - Smart (container): holds state + business logic, injects services, orchestrates.
  - Dumb (presentational): `input()` / `output()` only, pure, no service injection.
- Keep components small and focused (see file-size limits in root `CLAUDE.md`).

## Control Flow

- Use built-in `@if`, `@for`, `@switch`, `@defer`.
- **Never** `*ngIf` / `*ngFor` / `*ngSwitch`.

### Hurdle H5 — `$event` in a pseudo-event binding types as `Event`, not the specific subtype

- **Problem:** a binding like `(keydown.enter)="onActivateKey($event)"` looks like it should type
  `$event` as `KeyboardEvent` — the `.enter` suffix filters by key — but Angular's template type
  checker doesn't narrow based on that suffix. It stays `Event`. A handler declared as
  `onActivateKey(event: KeyboardEvent)` fails the build with
  `TS2345: Argument of type 'Event' is not assignable to parameter of type 'KeyboardEvent'`,
  even though the code is logically correct and works at runtime.
- **Correct pattern:** type the handler parameter as `Event` unless you truly need
  `KeyboardEvent`-only members (`key`, `code`, `ctrlKey`, ...). `event.target`,
  `event.currentTarget`, and `event.preventDefault()` all exist on the base `Event` interface, so
  most keyboard-activation handlers (e.g. guarding against bubbled events from a child element)
  never need the narrower type.
- **Applies to:** any pseudo-event binding (`.enter`, `.space`, `.escape`, `.control.z`, ...) whose
  handler is declared with a specific `Event` subtype.

## Dependency Injection

- Use the `inject()` function; do **not** use constructor injection.
  ```ts
  private router = inject(Router);
  ```

## State — Signals First

- Use signals for reactive local state: `signal`, `computed`, `effect`, `linkedSignal`.
- Use signal-based component APIs: `input()`, `output()`, `model()`, `viewChild()`, `contentChild()`.
- Avoid `@Input()` / `@Output()` decorators.
- Avoid RxJS `BehaviorSubject` for local UI state unless a genuinely complex async stream is required.
- Avoid unnecessary global state.

## Forms — Typed Reactive Forms

- Strongly typed `FormGroup` with a type alias; never template-driven forms for anything non-trivial.
  ```ts
  type RegisterForm = {
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  };
  private form = new FormGroup<RegisterForm>({ /* ... */ });
  ```

## Services & HTTP

- Services own HTTP communication and business logic — **not** UI logic.
- Configure via `provideHttpClient(withInterceptors([...]))`.
- Return typed observables, or use `resource()` / `httpResource()` where appropriate (Angular 21).
- Prefer signal-based data APIs for read-heavy views.
- Handle HTTP errors explicitly (401 / 403 / 409); map backend errors to user-friendly messages;
  never expose raw stack traces. (Auth transport and interceptor rules live in `security.md`.)

## Models & Types

- Strong typing via `interface` or `type`. **Avoid `any`.**
- Place domain models in `core/models/` or `features/<feature>/models/`.

## Routing

- Add a route only after the target component has a failing test AND a passing minimal implementation.
- Routes reflect real features — never placeholders or speculative components.
- Top-level nav in `app.routes.ts`; feature routes can live in
  `features/<feature>/<feature>.routes.ts` and be lazy-loaded.
- **Always lazy-load** feature components, and apply `canActivate: [authGuard]` to protected routes:
  ```ts
  {
    path: 'divisions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/divisions/divisions').then((m) => m.DivisionsComponent),
  }
  ```