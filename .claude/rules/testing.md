<!-- Applies to test files (*.spec.ts). TDD is the safety net that lets the human+AI
     pair move fast without breaking things. Apply the same continuous-refactoring
     discipline to specs as to production code. -->

# Testing Rules

## Fundamentals

- **Runner:** Vitest (not Karma/Jasmine). Mock with `vi` (e.g. `vi.spyOn(router, 'navigate')`).
- **Co-locate** `*.spec.ts` next to its source file.
- **TDD-first:** write the spec before implementing the feature.
- **Query the DOM via `data-testid`** — never CSS classes or tag names.
- **AAA pattern:** Arrange, Act, Assert, separated by blank lines.
- **Test behavior, not implementation.** Don't assert private methods or signal internals.
- **Isolation:** no shared mutable state across `it` blocks; reset spies/mocks in `beforeEach`.
  Each test must pass alone and in any order.
- **Test/code ratio target:** ≥ 1.3× (lines of test ≥ 1.3 × lines of code).

## Spec Structure (DRY & maintainable)

- **Shared setup in `beforeEach`:** lift `TestBed.createComponent`, `fixture.detectChanges()`, and
  the `nativeElement` cast into the outer `beforeEach`. Expose `fixture`, `component`, `compiled`
  as block-scoped `let` — never re-create them inside `it`.
- **Per-test variation is allowed:** when a test must mutate a mock BEFORE construction
  (see Hurdle H2), re-call `createComponent` inside that `it` / nested `describe`. Don't fight the
  framework by forcing one shared fixture.
- **Group with nested `describe` blocks** by concern (`form structure`, `submit button state`,
  `form submission`, `error handling`, `aria accessibility`, `returnUrl handling`).
- **Hard limit: 400 lines per spec file.** Cross it → refactor BEFORE adding tests: extract helpers,
  regroup with `describe`, or split by behavior domain (e.g. `login.component.returnUrl.spec.ts`).

## Typed Helpers (follow in every form spec)

- **Control-key type alias**, declared before the `let` bindings:
  ```ts
  type LoginControlKey = keyof LoginComponent['loginForm']['controls'];
  ```
- **DOM query helpers** — extract every repeated `querySelector` into a named function:
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
  Extract a helper as soon as it appears in 2+ tests. Never inline `querySelector` in `it` bodies.
- **`setControlValue` helper** — one function for "set value + optional touch + detectChanges":
  ```ts
  function setControlValue<K extends XControlKey>(key: K, value: string, touched = true): void {
    const control = component.xForm.controls[key] as FormControl<string>;
    control.setValue(value);
    if (touched) control.markAsTouched();
    fixture.detectChanges();
  }
  ```
- **`fillForm` with partial overrides** — covers both "valid form" and "one field invalid":
  ```ts
  function fillForm(values: Partial<Record<XControlKey, string>> = {}): void {
    const merged = { field1: 'defaultValid1', field2: 'defaultValid2', ...values };
    component.xForm.controls.field1.setValue(merged.field1);
    component.xForm.controls.field2.setValue(merged.field2);
    fixture.detectChanges();
  }
  ```
  `fillForm()` → all valid; `fillForm({ email: '' })` → one field empty. Reserve the
  third-repetition rule for orchestration helpers like `fillForm()`.

## Mock Factories

- Factor out mock factories for repeated HTTP scenarios. **Call the factory BEFORE `fillForm()`** in
  Arrange — it must be set up before the observable is triggered.
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
- **Describe-level payload constants:** when 2+ tests in a `describe` assert the same object, hoist it
  as a `const` at the describe level.

## Reactive Assertions

- **Call signal getters like functions** (`component.errorMessage()`, `component.isLoading()`).
  Never read `.value` or reach into internal RxJS subjects.

## Hurdle H2 — `TestBed.overrideProvider` fails after `TestBed.inject()` in `beforeEach`

- **Problem:** calling `TestBed.inject(Router)` in `beforeEach` instantiates the testing module
  immediately. A later `TestBed.overrideProvider(...)` inside an `it` throws
  *"Cannot override provider when the test module has already been instantiated."*
- **Correct pattern:** declare a **mutable mock object** and register it with
  `{ provide: Token, useValue: mockObject }` in `configureTestingModule`. Mutate its properties inside
  each test before `createComponent` — Angular reads the current state at injection time.
  ```ts
  let activatedRouteMock: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };
  beforeEach(() => {
    activatedRouteMock = { snapshot: { queryParamMap: convertToParamMap({}) } };
    TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }],
    });
  });
  it('specific case', () => {
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/divisions' });
    const fixture = TestBed.createComponent(MyComponent); // reads the updated mock
  });
  ```
- **Applies to** any provider needing per-test variation: `ActivatedRoute`, feature flags, config tokens.