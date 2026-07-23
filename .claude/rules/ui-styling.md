<!-- Applies to templates (*.html) and src/styles.css. When a component receives styling, it must support both light and dark states in the same commit — never add dark mode as a follow-up patch -->

# UI, Styling & i18n

## Tailwind CSS 4

- **Utility classes only.** Keep custom CSS in `styles.css` to an absolute minimum.
- **No per-component CSS files** for feature components.
- **Semantic design tokens — never hardcode color scales** (`text-blue-600`, `bg-red-500` are banned).
  Always use semantic names: `text-primary`, `bg-surface`, `text-on-primary`, `text-error`, `border-subtle`.
- **Dark mode:** support via Tailwind's `dark:` modifier (`class` strategy). Light + dark from day one.
- **Mobile-first:** start with the mobile layout, scale up with `md:` / `lg:` / `xl:`.
- **Validation UX:** show field errors only after `touched`. Put `data-testid` on every interactive element.
- **Accessibility:** semantic HTML, ARIA labels where needed, keyboard-navigable, focus-visible states.

## Hurdle H3 — Tailwind v4 tokens go in `@theme` (styles.css), not `tailwind.config.js`

- **Problem:** in Tailwind v4 (`@tailwindcss/postcss` + Angular esbuild), colors added to
  `theme.extend.colors` in `tailwind.config.js` do **not** generate utility classes
  (`text-error`, `bg-primary`, ...). The JS config is read for settings like `darkMode: 'class'`, but
  custom-color class generation needs the v4 CSS-first approach.
- **Correct pattern:** define semantic tokens in `src/styles.css` with `@theme`, then override per
  scheme in `:root.dark {}`:
  ```css
  @theme {
    --color-error: #dc2626;
    --color-primary: #171717;
    --color-on-primary: #ffffff;
    --color-surface: #ffffff;
    --color-subtle: #d4d4d4;
  }
  ```
  This generates `.text-error`, `.bg-primary`, `.text-on-primary`, `.border-subtle`, `.bg-surface`.
- **Naming:** the border token is `subtle` (CSS var `--color-subtle`) so the class is `border-subtle`,
  not `border-border-subtle`.
- **`tailwind.config.js` keeps only** `darkMode: 'class'` and static (non-dark-mode) tokens.
- **Verify:** grep the compiled `dist/*/browser/styles-*.css` for `.text-error`, `.bg-primary`.
  If the selectors are missing, the tokens weren't picked up.

## Pattern — Modals without `@angular/cdk`

The project has no overlay/dialog library installed. Modals (`DivisionFormComponent`,
`ConfirmDialogComponent`) are plain standalone components following this shape — reuse it for any
future modal (exercises, sets) instead of reaching for a dialog library:

- **Markup:** a fixed, full-viewport backdrop (`fixed inset-0 z-20 flex items-center justify-center
  bg-black/60`) wrapping a `role="dialog"` (or `role="alertdialog"` for destructive confirmations)
  panel with `aria-modal="true"` and `aria-labelledby`/`aria-describedby` pointing at the title/message.
- **Open/close state lives in the parent** (a `signal`), not in the modal — the modal is a dumb
  component rendered via `@if` in the container's template. Toggling the `@if` mounts/unmounts it.
- **Esc closes it:** `@HostListener('document:keydown.escape')` emits the modal's `cancelled` output.
  Don't name the output `cancel` — `@angular-eslint/no-output-native` rejects it because it collides
  with the native DOM `cancel` event.
- **Initial focus:** a template reference variable (`#nameInput`, `#cancelButton`) read via
  `viewChild<ElementRef<T>>(...)`, focused in a constructor `effect()` once the signal resolves.
  Don't default focus to a destructive primary action — `ConfirmDialogComponent` focuses **Cancel**,
  not **Confirm**, so an accidental Enter keypress can't trigger the destructive action.
- **In-flight requests:** the container passes an `isSubmitting`/`isConfirming` input down; the modal
  disables its primary button (`disabled:opacity-40 disabled:cursor-not-allowed`) while `true`. Guard
  the handler itself too (`if (this.isSubmitting()) return;`), since a disabled button doesn't stop a
  form's Enter-key submission.

## Language & i18n — "Code speaks English. Users read Portuguese."

The app targets Brazilian users. **All user-facing strings are in Portuguese; all code is in English.**
Never mix the two layers.

| Layer | Language | Examples |
|---|---|---|
| Variable / method / class names | English | `isSubmitting`, `errorMessage`, `onSubmit()` |
| Interface / type names | English | `RegisterForm`, `PasswordPatternRule` |
| Template attributes | English | `formControlName`, `data-testid`, `aria-*` |
| Comments and rule files | English | `// reset error before new request` |
| Test descriptions (`it`, `describe`) | English | `'should disable submit button when email is empty'` |
| Labels, placeholders, headings | Portuguese | `'Email'`, `'Senha'`, `'Nome'` |
| Validation error messages | Portuguese | `'O campo é obrigatório.'` |
| Button labels | Portuguese | `'Entrar'`, `'Registro'`, `'Criar conta'` |
| Loading states | Portuguese | `'Entrando...'`, `'Registrando...'` |
| API error messages shown to user | Portuguese | `'Credenciais inválidas.'` |

- **Do NOT introduce an i18n library** until explicitly requested (YAGNI). For the MVP, Portuguese
  strings inline in templates are intentional. When locales expand later, the code layer stays English
  and only string extraction changes — no component logic changes if this rule is followed from the start.
- **Violations:** English user-facing strings, OR Portuguese identifiers / type names / test descriptions.