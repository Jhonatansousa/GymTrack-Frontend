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
- **Fields:** `name` (string), `reps` (int), `weight` (double/long).
- **Auto-naming rule:** if `name` is empty or null, the backend auto-generates an incremental string
  ("1", "2", ...). The frontend form **must keep `name` optional** to leverage this backend logic.