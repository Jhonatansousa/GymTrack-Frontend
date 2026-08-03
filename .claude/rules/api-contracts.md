<!-- Applies to services and features that call the backend (src/app/core, src/app/features).
     Backend: Spring Boot 3.x + PostgreSQL. Assume all feature endpoints are secured. -->

# Backend API Contracts & Business Rules

## Global

- **Base URL (dev):** `http://localhost:8080/api/v1`
- **Base URL (prod):** `https://gymtrack-83nr.onrender.com/api/v1`
- **Authentication:** HttpOnly session cookie issued by the backend — **no `Authorization: Bearer`
  header, no token in JS.** All auth-related calls use `withCredentials: true`. The full model
  (interceptors, CORS, CSRF, session check) lives in `security.md`, which is authoritative.

## A. Authentication (`/auth`)

- **`POST /auth/register`** — accepts `{ name, email, password }`. Backend auto-authenticates on
  registration by setting the HttpOnly session cookie. Frontend navigates to `/dashboard` on success.
- **`POST /auth/login`** — accepts `{ email, password }`. Backend sets the HttpOnly session cookie.
  Response body is treated as opaque by the frontend (typed `{ results: unknown }`).
- **Storage:** HttpOnly cookies only. No token storage in JS.

## B. Workout Divisions (`/divisions`)

- **`POST /divisions`** — body `{ name }`. 201 on success, 409 if the name already exists.
- **`GET /divisions`** — lists all divisions for the authenticated user. Response items are
  `{ id, name }` only — **no `exerciseCount` or `lastTrained`-style fields.** Don't invent them on
  the frontend; if the design needs that metadata, it has to come from the backend first.
- **`PATCH /divisions/{id}`** — body `{ newName }`, **not** `{ name }`. This is asymmetric with the
  POST payload and easy to get wrong (a 400 is the symptom). 200 on success, 404 if not found, 409 if
  the new name collides with an existing one.
- **`DELETE /divisions/{id}`** — 200 on success, 404 if not found.
- **Cascade rule:** deleting a division deletes all exercises and sets inside it. The UI **must** show
  a confirmation modal warning about the cascade before deletion.

## C. Exercises (`/exercises`)

- **Relationship:** belong to a division (`workoutDivisionId`).
- **`POST /exercises`** — body `{ name, workoutDivisionId }`.
- **`GET /exercises/{divisionId}`** — lists exercises for a division. **Path param, not query
  string.** Response items are `{ exerciseId, exerciseName, workoutDivisionId }` — **not**
  `{ id, name }` like divisions. See Hurdle H4 below before touching this service.
- **`PATCH /exercises/{id}`** — body `{ newExerciseName }`, **not** `{ newName }` (divisions use
  `newName` — the two resources are inconsistent with each other, not just with their own POST).
  Response body is `{ status: "SUCCESS" }` with **no `results`** — the backend does not return the
  updated resource, so `ExercisesService.update()` returns `Observable<void>`.
- **`DELETE /exercises/{id}`** — 200 on success.
- **No exercise-count / set-count field.** Same rule as divisions (§B): don't invent it on the
  frontend. The prototype's "N séries" label is intentionally omitted until the backend adds it.

### Hurdle H4 — Exercises use different field names than every other resource

- **Problem:** `POST /divisions` and `PATCH /divisions/{id}` both key off `name`/`newName`, and the
  divisions list returns `{ id, name }`. Exercises break that convention three ways at once:
  the list response uses `exerciseId`/`exerciseName` (not `id`/`name`), `POST` still accepts a
  plain `name` field, and `PATCH` expects `newExerciseName` (not `newName`). None of this is
  written anywhere in the backend docs — it was found by inspecting real Network tab responses
  after the create/rename/delete flow silently failed (rename sent `PATCH .../undefined` because
  the frontend read a `.id` field that didn't exist on the response).
- **Correct pattern:** never let a resource's raw field names leak past its service. `exercise.model.ts`
  declares two shapes: `Exercise` (`{ id, name, workoutDivisionId }`, the clean shape every
  component/spec uses) and `ExerciseDto` (`{ exerciseId, exerciseName, workoutDivisionId }`, the
  literal backend shape). `ExercisesService` maps `ExerciseDto → Exercise` via a private `toExercise()`
  function immediately after every HTTP call — no component, template, or spec outside
  `exercises.service.ts`/`.spec.ts` ever sees `exerciseId`/`exerciseName`.
- **Applies to:** any future resource whose backend field names don't match its own request body
  keys. Before wiring a new service, flush a real request in the Network tab and compare the
  response shape against what the request body used — don't assume symmetry.

## D. Sets (`/sets`)

- **Relationship:** belong to an exercise (`exerciseId`).
- **Fields:** `name` (string), `reps` (int), `weight` (double).
- **`POST /sets`** — body `{ exerciseId, name?, reps?, weight? }`. 201 on success. `name` is
  optional (see auto-naming rule below); omitted `reps`/`weight` default to `0`/`0.0` server-side.
  Response is `{ status, results: SetDto }`.
- **`GET /sets/{exerciseId}`** — lists sets for an exercise, ordered by id ascending. **Path
  param, not query string** (same pattern as `GET /exercises/{divisionId}`). Response is
  `{ status, results: SetDto[] }`.
- **`PATCH /sets/{exerciseSetId}`** — body `{ newName?, reps?, weight? }`, **all fields optional
  and independently nullable.** The backend only overwrites a field when it is non-null in the
  request — sending `{ reps, weight }` leaves the name untouched, and sending `{ newName }` alone
  leaves the numbers untouched. This is a **partial update**, unlike divisions/exercises PATCH
  which always require the renamed field. Response is `{ status }`, **no `results`** — same as
  exercises, `SetsService.update()` returns `Observable<void>`.
- **`DELETE /sets/{exerciseSetId}`** — 200 on success, `{ status }`, no `results`.
- **Auto-naming rule:** if `name` is empty or null on `POST`, the backend counts existing sets for
  the exercise and auto-generates the next incremental string ("1", "2", ...). The frontend "add
  set" action **must send no `name` field at all** (just `{ exerciseId }`) to leverage this — no
  create form is needed for sets.
- **No cascade on delete.** Unlike divisions/exercises, a set has no children — deleting one does
  not warn about cascading deletes, just a plain confirmation.

### Hurdle H6 — Sets use a *third* name for the same field, and PATCH is partial

- **Problem:** the "name" field for a set has **three different keys** depending on the verb:
  `POST /sets` accepts `name`, the response DTO (`SetDto`) returns it as `setName`, and
  `PATCH /sets/{id}` expects `newName`. This is the same shape of problem as Hurdle H4
  (exercises), but with three names instead of two — inspecting the real backend source
  (`ExerciseSetResponseDTO`, `ExerciseSetDTO`, `ExerciseSetUpdateDTO` in the Spring Boot repo) was
  what confirmed this, since none of it is documented anywhere else. The response DTO also uses
  `exerciseSetId`, not `id` — same convention break as `exerciseId` on `ExerciseDto`.
- **Second trap — partial PATCH:** `ExerciseSetServiceImpl.updateExerciseSet()` only assigns a
  field on the entity when the corresponding DTO field is non-null. A naive `SetsService.update()`
  that always sends all three fields (`{ newName, reps, weight }`) would work, but a component
  that wants to change *only* the weight (e.g. a debounced stepper) should send `{ weight }`
  alone — sending `{ newName: undefined, reps: undefined, weight }` serializes fine over
  `HttpClient` (Angular drops `undefined` keys from the JSON body), so build the update payload as
  a partial object, not a fully-populated one with placeholder values.
- **Correct pattern:** `workout-set.model.ts` declares `WorkoutSet` (`{ id, name, reps, weight,
  exerciseId }`, the clean shape) and `WorkoutSetDto` (`{ exerciseSetId, setName, reps, weight,
  exerciseId }`, the literal backend shape), plus a separate `WorkoutSetUpdate` type
  (`{ newName?, reps?, weight? }`) for the PATCH body — this type is intentionally **not** derived
  from `WorkoutSet` because the key names diverge (`newName`, not `name`). `SetsService` maps
  `WorkoutSetDto → WorkoutSet` via a private `toWorkoutSet()` function; no component, template, or
  spec outside `sets.service.ts`/`.spec.ts` ever sees `exerciseSetId`/`setName`/`newName`.
- **Note on the model name:** the domain type is called `WorkoutSet`, not `Set` — `Set` is a
  built-in JavaScript/TypeScript type (`new Set([1, 2, 3])`) and shadowing it silently breaks any
  code in the same file that expects the real one.
- **Applies to:** any future PATCH endpoint on this backend — check whether it's a partial update
  (only provided fields change) or a full replace before assuming either.