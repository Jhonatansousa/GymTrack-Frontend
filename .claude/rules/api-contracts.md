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

- **Operations:** create (`name`), read (list all), update (rename), delete.
- **Cascade rule:** deleting a division deletes all exercises and sets inside it. The UI **must** show
  a confirmation modal before deletion.

## C. Exercises (`/exercises`)

- **Relationship:** belong to a division (`workoutDivisionId`).
- **Operations:** create (`name`), read (list by division), update (rename), delete.

## D. Sets (`/sets`)

- **Relationship:** belong to an exercise (`exerciseId`).
- **Fields:** `name` (string), `reps` (int), `weight` (double/long).
- **Auto-naming rule:** if `name` is empty or null, the backend auto-generates an incremental string
  ("1", "2", ...). The frontend form **must keep `name` optional** to leverage this backend logic.