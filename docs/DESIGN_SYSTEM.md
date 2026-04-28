# GymTrack — Design System

> **Living Document.** Evolves with the product. When a visual decision is made
> and its rationale is non-obvious, document it here.
>
> **Mandatory for AI sessions that touch UI.** Paste this file (or the
> "Session Context" block at the bottom) at the start of any session involving
> component creation or styling. The AI must apply every rule here before
> writing a single class.

---

## 1. Visual Identity & Philosophy

GymTrack's UI is **dark, editorial, and precise**. It draws from the
aesthetics of technical documentation and performance dashboards — not fitness
apps. The design reads "tool for serious athletes", not "consumer wellness app".

Core principles:

- **Depth through elevation, not shadow.** Three background levels create
  hierarchy. Drop-shadows are almost never used.
- **Accent is a privilege.** The lime-yellow (`#d4ff4f`) appears in at most
  one focal point per surface. Overuse kills its power.
- **Mono for metadata, serif for display, sans for body.** Every typeface has
  a job and never does another's job.
- **Borders are quiet.** They define edges, they don't decorate.
- **Color carries semantic meaning.** Warn, danger, success are never used
  decoratively.

---

## 2. Color Tokens

### 2.1 `@theme` block — paste into `src/styles.css`

Replace (or merge with) the existing `@theme {}` block. The `:root.dark {}`
block is the canonical dark-mode override (the app ships dark-by-default).

```css
@theme {
  /* ─── Canvas & Elevation ─────────────────────────────── */
  --color-canvas:        #0d0d0e;   /* deepest bg — body background           */
  --color-surface:       #16161a;   /* cards, panels, sidebar                 */
  --color-surface-raised:#1c1c22;   /* table headers, nested panels           */

  /* ─── Borders ────────────────────────────────────────── */
  --color-border:        #2a2a32;   /* default borders                        */
  --color-border-strong: #3a3a44;   /* focus rings, checkboxes                */

  /* ─── Text ───────────────────────────────────────────── */
  --color-text:          #e8e6e0;   /* primary readable text                  */
  --color-text-muted:    #9b9892;   /* secondary labels, captions             */
  --color-text-faint:    #6a6862;   /* placeholders, disabled, timestamps     */

  /* ─── Accent (lime-yellow) ───────────────────────────── */
  --color-accent:        #d4ff4f;   /* CTA borders, active states, highlights */
  --color-accent-dim:    #8a9d2e;   /* accent on dark text (accessibility)    */
  --color-on-accent:     #0d0d0e;   /* text/icon ON an accent background      */

  /* ─── Semantic Status ────────────────────────────────── */
  --color-success:       #4fd494;
  --color-warn:          #ff8b3d;
  --color-error:         #ff5959;
  --color-info:          #7fb3ff;

  /* ─── Legacy aliases (keep until auth components are refactored) ── */
  --color-primary:       #d4ff4f;   /* was neutral dark; now maps to accent   */
  --color-on-primary:    #0d0d0e;
  --color-subtle:        #2a2a32;   /* maps to border token                   */
}

/* Dark mode is the default. Light mode is not supported in MVP. */
```

> **Naming convention (Hurdle H3):** The token is named `border` (not
> `color-border`) so the generated Tailwind class is `border-border` — no,
> wait. Tailwind generates `bg-<name>`, `text-<name>`, `border-<name>`. So
> `--color-border` → `border-border`, `bg-border` (not useful).
> For border-color utilities use `border-border` (the class) which maps to
> `--color-border`. This is correct Tailwind v4 behavior.

### 2.2 Semantic Token Reference

| CSS Variable            | Tailwind Class         | Use case                                   |
|-------------------------|------------------------|--------------------------------------------|
| `--color-canvas`        | `bg-canvas`            | `<body>` background                        |
| `--color-surface`       | `bg-surface`           | Cards, sidebars, modals                    |
| `--color-surface-raised`| `bg-surface-raised`    | Table headers, nested panels               |
| `--color-border`        | `border-border`        | Default 1px borders                        |
| `--color-border-strong` | `border-border-strong` | Focus rings, selected states               |
| `--color-text`          | `text-text`            | Primary body copy                          |
| `--color-text-muted`    | `text-text-muted`      | Labels, secondary info                     |
| `--color-text-faint`    | `text-text-faint`      | Placeholders, disabled, timestamps         |
| `--color-accent`        | `text-accent` / `border-accent` / `bg-accent` | Focal highlights, CTAs |
| `--color-on-accent`     | `text-on-accent`       | Text placed ON an accent background        |
| `--color-error`         | `text-error`           | Validation errors, danger states           |
| `--color-warn`          | `text-warn`            | Warnings, caution                          |
| `--color-success`       | `text-success`         | Confirmations, positive feedback           |
| `--color-info`          | `text-info`            | Informational callouts                     |

### 2.3 Radial gradient background (body)

Add to `body` in `styles.css` — creates depth without being distracting:

```css
body {
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(212, 255, 79, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(127, 179, 255, 0.03) 0%, transparent 50%);
}
```

---

## 3. Typography

### 3.1 Font Stack

Three families, each with a strict role:

| Family         | Variable    | Role                                      |
|----------------|-------------|-------------------------------------------|
| **Fraunces**   | `--font-serif` | Display headings, brand mark, large numbers, hero text |
| **Inter Tight**| `--font-sans`  | All body copy, UI labels, form fields, buttons |
| **JetBrains Mono** | `--font-mono` | Metadata labels, timestamps, numeric data, code, badge text |

**Rule:** if you're unsure which family to use, it's Inter Tight. Fraunces
is reserved for impact moments. JetBrains Mono is reserved for data/metadata.
Never use them interchangeably.

### 3.2 Google Fonts import

Add to `src/index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500;700&family=Inter+Tight:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
>
```

### 3.3 `@theme` additions for font families

```css
@theme {
  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans:  'Inter Tight', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', monospace;
}
```

### 3.4 Typographic Scale & Usage

| Element            | Family   | Weight | Size (approx) | Class pattern                         |
|--------------------|----------|--------|---------------|---------------------------------------|
| Hero / page title  | Fraunces | 900    | 56–64px       | `font-serif font-black text-6xl`      |
| Section heading h2 | Fraunces | 600    | 32–36px       | `font-serif font-semibold text-4xl`   |
| Card title h3      | Inter Tight | 600 | 18px         | `font-sans font-semibold text-lg`     |
| Body paragraph     | Inter Tight | 400 | 15px         | `font-sans text-sm leading-relaxed`   |
| Metadata / label   | JetBrains Mono | 500 | 10–11px  | `font-mono text-xs uppercase tracking-widest` |
| Badge / tag        | JetBrains Mono | 700 | 10.5px   | `font-mono text-[10.5px] font-bold tracking-wide` |
| Input / button     | Inter Tight | 500 | 14–15px      | `font-sans font-medium`               |
| Eyebrow (pre-heading) | JetBrains Mono | 700 | 11px  | `font-mono text-[11px] uppercase tracking-[0.2em] text-accent` |

### 3.5 Letter spacing conventions

- Section labels / eyebrows: `tracking-[0.18em]` to `tracking-[0.2em]`
- Badge text: `tracking-[0.05em]` to `tracking-[0.12em]`
- Body: default (`tracking-normal`)
- Display headings: negative — `tracking-[-0.02em]` to `tracking-[-0.03em]`

---

## 4. Component Patterns

The following patterns define GymTrack's component vocabulary. Every new
component should first check if an existing pattern applies.

### 4.1 Card / Panel

Elevated surface with subtle border. The workhorse of the UI.

```html
<div class="bg-surface border border-border rounded-md p-5">
  <!-- content -->
</div>
```

**With accent left-border (active/highlighted state):**

```html
<div class="bg-surface-raised border-l-[3px] border-l-accent rounded-r-sm px-5 py-4">
  <!-- content -->
</div>
```

### 4.2 Section / Eyebrow Label

Used above section headings and to label data groups.

```html
<p class="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
  Divisões de Treino
</p>
```

### 4.3 Callout / Alert

Four semantic variants sharing the same base. Always left-bordered.

```html
<!-- Default (accent) -->
<div class="bg-surface border border-border border-l-[3px] border-l-accent rounded-r-sm p-[18px_22px]">
  <p class="font-mono text-[11px] uppercase tracking-[0.15em] text-accent font-bold mb-2">Nota</p>
  <p class="text-text-muted text-sm">Conteúdo do callout.</p>
</div>

<!-- Warn variant: replace border-l-accent → border-l-warn, text-accent → text-warn -->
<!-- Danger variant: replace with border-l-error, text-error -->
<!-- Success variant: replace with border-l-success, text-success -->
```

### 4.4 Badge / Tag

Mono text in a tinted pill. Used for status, type labels, exercise muscle group.

```html
<!-- Accent variant -->
<span class="inline-block px-2 py-0.5 rounded-[3px] font-mono text-[10.5px] font-bold
             tracking-[0.05em] bg-accent/15 text-accent">
  Principal
</span>

<!-- Warn variant -->
<span class="inline-block px-2 py-0.5 rounded-[3px] font-mono text-[10.5px] font-bold
             tracking-[0.05em] bg-warn/15 text-warn">
  Atenção
</span>
```

### 4.5 Form Input

```html
<input
  class="w-full bg-surface-raised border border-border rounded px-3 py-2.5
         font-sans text-sm text-text placeholder:text-text-faint
         focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent/30
         transition-colors duration-150"
  placeholder="email@exemplo.com"
/>
```

**Error state (add when `form.controls.x.invalid && form.controls.x.touched`):**

```html
<!-- Add to class -->
border-error focus:border-error focus:ring-error/20
```

**Error message:**

```html
<p class="font-mono text-[11px] text-error mt-1.5 tracking-wide" data-testid="field-error">
  O campo é obrigatório.
</p>
```

### 4.6 Button — Primary CTA

```html
<button
  class="w-full bg-accent text-on-accent font-sans font-semibold text-sm px-4 py-2.5
         rounded transition-all duration-150
         hover:bg-accent/90
         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
         disabled:opacity-40 disabled:cursor-not-allowed"
>
  Entrar
</button>
```

### 4.7 Button — Ghost / Secondary

```html
<button
  class="font-sans text-sm text-text-muted hover:text-text
         transition-colors duration-150 underline-offset-4 hover:underline"
>
  Criar conta
</button>
```

### 4.8 Navigation Link (sidebar/tabs)

```html
<!-- Inactive -->
<a class="block px-3 py-[7px] text-text-muted text-sm rounded
          border-l-2 border-transparent
          hover:text-text hover:bg-surface-raised
          transition-all duration-150">
  Exercícios
</a>

<!-- Active -->
<a class="block px-3 py-[7px] text-accent text-sm rounded
          border-l-2 border-accent bg-surface-raised">
  Exercícios
</a>
```

### 4.9 Data Table

```html
<div class="overflow-x-auto border border-border rounded-md bg-surface">
  <table class="w-full border-collapse text-[13.5px]">
    <thead>
      <tr>
        <th class="text-left px-3.5 py-3 bg-surface-raised
                   font-mono text-[10.5px] uppercase tracking-[0.12em]
                   text-text-muted font-medium border-b border-border whitespace-nowrap">
          Exercício
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-accent/[0.02] transition-colors">
        <td class="px-3.5 py-[11px] border-b border-border text-text">
          Supino Reto
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4.10 Loading / Skeleton State

```html
<div class="animate-pulse bg-surface-raised rounded h-4 w-3/4"></div>
```

---

## 5. Spacing & Layout Principles

- **Base unit:** 4px (Tailwind default). Prefer multiples of 4.
- **Card internal padding:** `p-5` (20px) standard, `p-[18px_22px]` for callouts.
- **Section gap:** `mb-16` to `mb-20` between major page sections.
- **Component gap:** `gap-3` or `gap-4` inside grids and flex containers.
- **Border radius:** `rounded` (4px) for inputs/buttons, `rounded-md` (6px) for
  cards/panels. Never `rounded-full` on rectangular elements.

---

## 6. Interaction & Animation

- **Transition default:** `transition-all duration-150` or `transition-colors duration-150`.
  150ms is the GymTrack standard — fast enough to feel snappy, not jarring.
- **Hover lift on cards (optional, use sparingly):**
  `hover:-translate-y-0.5 transition-transform duration-200`
- **Focus visible:** always use `focus-visible:` (not `focus:`) for keyboard
  accessibility. Ring color is `accent/30`.
- **No bounce, no spring, no elastic easing.** The app is precise, not playful.

---

## 7. Accessibility Baseline

- Every interactive element must be keyboard-reachable and have a visible
  `focus-visible` ring.
- Color is never the only differentiator — pair color with shape, icon, or label.
- All form inputs must have an associated `<label>` (visually or via `aria-label`).
- Error messages must be associated via `aria-describedby` pointing to the field.
- Icons without adjacent visible text must have `aria-label` or `aria-hidden="true"`
  with a sibling screen-reader-only `<span class="sr-only">`.

---

## 8. Anti-Patterns (never do these)

| ❌ Anti-pattern                           | ✅ Correct alternative                          |
|-------------------------------------------|------------------------------------------------|
| `text-blue-600`, `bg-red-500`             | Semantic tokens: `text-info`, `text-error`     |
| `font-['Inter']` or system-ui default     | `font-sans` (Inter Tight via @theme)           |
| White or light backgrounds in components  | `bg-canvas`, `bg-surface`, `bg-surface-raised` |
| Accent on every element                   | Accent on ONE focal point per surface           |
| `rounded-full` on rectangular inputs      | `rounded` or `rounded-md`                      |
| `transition-all duration-300` or longer   | `duration-150` max for micro-interactions      |
| `border-gray-*`, `text-gray-*`            | `border-border`, `text-text-muted`             |
| Hardcoded `#d4ff4f` anywhere in a component | `text-accent`, `bg-accent`, `border-accent`   |

---

## 9. Complete `styles.css` Reference

Here is the complete recommended `src/styles.css` incorporating all tokens.
Adapt to what's already present — do not blindly replace.

```css
@import 'tailwindcss';

@theme {
  /* Canvas & Elevation */
  --color-canvas:         #0d0d0e;
  --color-surface:        #16161a;
  --color-surface-raised: #1c1c22;

  /* Borders */
  --color-border:         #2a2a32;
  --color-border-strong:  #3a3a44;

  /* Text */
  --color-text:           #e8e6e0;
  --color-text-muted:     #9b9892;
  --color-text-faint:     #6a6862;

  /* Accent */
  --color-accent:         #d4ff4f;
  --color-accent-dim:     #8a9d2e;
  --color-on-accent:      #0d0d0e;

  /* Semantic status */
  --color-success:        #4fd494;
  --color-warn:           #ff8b3d;
  --color-error:          #ff5959;
  --color-info:           #7fb3ff;

  /* Legacy aliases — remove after auth components are refactored */
  --color-primary:        #d4ff4f;
  --color-on-primary:     #0d0d0e;
  --color-subtle:         #2a2a32;

  /* Font families */
  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans:  'Inter Tight', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', monospace;
}

html, body {
  background-color: var(--color-canvas);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(212, 255, 79, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(127, 179, 255, 0.03) 0%, transparent 50%);
}
```

---

## 10. AI Session Context (paste at start of UI sessions)

When starting a new session focused on UI/component work, paste the block below
before your request. It primes the AI with the design constraints without
requiring it to read this entire document.

```
--- GYMTRACK DESIGN CONTEXT ---
Stack: Angular 21 standalone, Tailwind v4 (CSS-first @theme), Vitest, dark-only.

Typography:
- font-serif → Fraunces (display headings, hero, large numbers only)
- font-sans  → Inter Tight (all body, UI, buttons — the default)
- font-mono  → JetBrains Mono (labels, metadata, badges, timestamps)

Semantic color tokens (defined in @theme — never use hardcoded values):
- Backgrounds: bg-canvas / bg-surface / bg-surface-raised
- Borders: border-border / border-border-strong
- Text: text-text / text-text-muted / text-text-faint
- Accent (lime-yellow, use sparingly): text-accent / bg-accent / border-accent / text-on-accent
- Status: text-error / text-warn / text-success / text-info

Component rules:
- Cards: bg-surface border border-border rounded-md
- Accent highlight: border-l-[3px] border-l-accent (left border only)
- Inputs: bg-surface-raised border border-border, focus:ring-accent/30
- CTA button: bg-accent text-on-accent font-semibold
- Labels/eyebrows: font-mono uppercase tracking-[0.18em] text-text-muted or text-accent
- Transitions: duration-150 always
- No drop shadows. No light backgrounds. Accent on ONE focal point per surface.

All user-facing strings in Portuguese. All identifiers/tests in English.
--- END DESIGN CONTEXT ---
```

---

*Last updated: 2025-Q2 — after design system extraction from `programa-hipertrofia.html` reference.*