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
- **Operations:** create (`name`), read (list by division), update (rename), delete.

## D. Sets (`/sets`)

- **Relationship:** belong to an exercise (`exerciseId`).
- **Fields:** `name` (string), `reps` (int), `weight` (double/long).
- **Auto-naming rule:** if `name` is empty or null, the backend auto-generates an incremental string
  ("1", "2", ...). The frontend form **must keep `name` optional** to leverage this backend logic.