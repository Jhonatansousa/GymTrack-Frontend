# Copilot / AI Agent Instructions for GymTrack Frontend

This file contains concise, actionable guidance for AI coding agents working on this Angular 21 project. This frontend connects to a Java Spring Boot REST API.

## 1. Project Snapshot & Ecosystem
- **Framework:** Angular 21 (Standalone Components strictly).
- **Backend API:** Spring Boot 3.x with PostgreSQL. 
  - *Dev Environment:* `http://localhost:8080/api/v1`
  - *Prod Environment:* `https://gymtrack-83nr.onrender.com/api/v1`
- **Bootstrapping:** `bootstrapApplication` using `appConfig` in `src/app/app.config.ts`.
- **Styling:** SCSS globally. Use ready-to-use component libraries (e.g., Angular Material or Tailwind UI) for rapid UI scaffolding.
- **Visual Style:** Modern, polished, and professional UI. Prefer ready-made component libraries (Material/Tailwind) for a consistent look.

## 2. Architecture & Directory Structure
Adhere strictly to the following structure to maintain separation of concerns:

- `src/app/core/`: Singleton services, guards, HTTP interceptors (JWT), and interface models.
  - *MVP vs Ideal:* In this MVP, models can be simple interfaces matching backend DTOs. Ideally, in a massive enterprise app, we would use strict classes or DTO mappers on the frontend to handle data transformations.
- `src/app/features/`: Domain-specific standalone components and feature-level services.
  - `/auth`: Login and Register pages.
  - `/divisions`: Workout divisions list and management.
  - `/exercises`: Exercises within a division.
  - `/sets`: Sets within an exercise.
- `src/app/shared/`: Reusable, dumb UI components (buttons, modals, cards).
  - `/components/layout`: App shell containing the **Fixed Header** (Project name + Navigation) and **Footer** (Author name + Contact info).
- `src/app/app.routes.ts`: Centralized routing. Default redirect to `/login`.
- `src/app/app.config.ts`: Global providers (`provideHttpClient`, `provideRouter`).

## 3. Business Rules & Feature Specifications
When generating components or services for these features, follow these exact workflows:

### A. Authentication (`/auth`)
- **Register:** Accepts `name`, `email`, and `password`. The backend auto-authenticates upon registration. The UI should seamlessly store the returned JWT and navigate to the main dashboard.
- **Login:** Accepts `email` and `password`. Returns a JWT token.
- *Best Practice:* Store the JWT in `localStorage` for the MVP. 
  - *MVP vs Ideal:* Storing JWT in `localStorage` is acceptable for a portfolio MVP. In a production-grade ideal scenario, tokens should be stored in `HttpOnly` secure cookies to prevent XSS attacks.

### B. Workout Divisions (`/divisions`)
- **CRUD Operations:** Create (needs `name`), Read (list all), Update (rename), Delete.
- **Cascade Rule:** Emphasize to the user that deleting a division deletes all exercises and sets inside it. The UI should prompt a confirmation modal before deletion.

### C. Exercises (`/exercises`)
- Belong to a Division (`workoutDivisionId`).
- **CRUD Operations:** Create (needs `name`), Read (list by division), Update (rename), Delete.

### D. Sets (`/sets`)
- Belong to an Exercise (`exerciseId`).
- **Fields:** `name` (string), `reps` (int), `weight` (double/long).
- **Auto-naming Rule:** If the `name` field is sent as empty or null, the backend automatically generates an incremental string (e.g., "1", "2"). The frontend form should make the `name` field optional to leverage this backend logic.

## 4. Coding Conventions & Best Practices

- **Standalone Components Only:** Do not generate `NgModules`. Use `imports: [CommonModule, ReactiveFormsModule, ...]` directly in the `@Component` decorator.
- **HTTP Interceptor:** Create a `JwtInterceptor` in `core/interceptors/jwt.interceptor.ts` using the functional interceptor pattern (`HttpInterceptorFn`). It must attach `Authorization: Bearer <token>` to all requests aiming at the API.
  - *Example:* Register via `provideHttpClient(withInterceptors([jwtInterceptor]))` in `app.config.ts`.
- **Environment Variables:** Use Angular environments (`environment.ts` and `environment.development.ts`) to switch between the local API (`http://localhost:8080/api/v1`) and the Render production URL.
- **State Management:** Use Angular Services with `BehaviorSubject` or Angular Signals (preferred in Angular 21) to manage local state (e.g., the currently selected workout division).
- *MVP vs Ideal:* For an MVP, Signals inside injectable services are perfectly lightweight and didactic. Ideally, for an app with heavy offline capabilities, something like NgRx would be implemented.

- Always use the inject() function for dependency injection instead of constructor injection. This makes the code cleaner and easier to maintain.

- Control Flow: "Use the new Angular 17+ control flow syntax (@if, @for, @switch) instead of the old structural directives (*ngIf, *ngFor).

- Use Angular Signals (signal, computed, effect) for state management inside components and services. Avoid RxJS BehaviorSubject unless strictly necessary for complex asynchronous streams.

## 5. DTO Contracts (Real-world backend mapping)
Ensure frontend models strictly match these backend expectations:
- `RegisterRequestDTO`: `{ name: string, email: string, password: string }`
- `LoginRequestDTO`: `{ email: string, password: string }`
- `WorkoutDivisionDTO`: `{ name: string }`
- `ExerciseDTO`: `{ workoutDivisionId: number, name: string }`
- `ExerciseSetDTO`: `{ exerciseId: number, name?: string, reps: number, weight: number }`

## 6. Prompts for AI Agents (Examples)
When asking the AI for help, use specific prompts like:
- *"Generate a functional HTTP interceptor for Angular 21 that retrieves the JWT from localStorage and attaches it to the Authorization header. Register it in app.config.ts."*
- *"Create a standalone login component in `features/auth` using Reactive Forms. Include validation for email and password, and use the AuthService to authenticate against the `/api/v1/auth/login` endpoint."*
- *"Scaffold the App Shell layout in `shared/components/layout` with a fixed top header containing a placeholder menu, and a footer containing author contact info. Use semantic HTML5 tags."*
- *"Generate a service for Exercise Sets using Angular Signals to cache the list of sets for a given exerciseId."*

## 7. Constraints
- **Do not** assume `AppModule` exists.
- **Do not** write business logic inside components; delegate HTTP calls and data formatting to services in `core/services`.
- **Always** handle HTTP errors gracefully (e.g., catching 401 Unauthorized to redirect to login, or 409 Conflict for duplicated names).