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