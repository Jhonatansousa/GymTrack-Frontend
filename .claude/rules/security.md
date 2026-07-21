<!-- Applies to ALL files. Security is a habit scattered across every commit, never a
     final "security sprint". This file is the single source of truth for auth transport:
     it SUPERSEDES any older reference to "Authorization: Bearer" or "JWT injection"
     elsewhere in the docs. When in doubt about auth, this file wins. -->

# Security Rules

## 1. Authentication & Session — HttpOnly Cookies (authoritative)

**Architectural decision:** the session token is issued and stored by the backend as an
**`HttpOnly; Secure; SameSite` cookie**. The frontend never reads, writes, or stores the
token in JS. This removes the XSS token-theft surface entirely.

- **No token in JS.** No `localStorage`, no `sessionStorage`, no in-memory cache, no `TokenService`.
  If you feel the urge to build one, stop — the cookie already does it.
- **No `Authorization: Bearer` header, ever.** There is no token in JS to inject. Any change that
  adds Bearer-header injection is a security regression. (This overrides any legacy note that
  mentions Bearer tokens or "JWT injection".)
- **`withCredentials: true`** on every request to `environment.apiBaseUrl`. This is what makes the
  HttpOnly cookie flow automatically. Prefer the `credentialsInterceptor` over per-call flags.
- **Backend owns the session.** Login/register responses set `Set-Cookie`. Logout is a backend
  endpoint that clears the cookie (`Set-Cookie: ...; Max-Age=0`) — the frontend cannot clear
  HttpOnly cookies.
- **Session check:** on app init or protected-route entry, call `/auth/me` (or equivalent).
  200 → authenticated; 401 → redirect to `/auth`.
- **CORS:** backend must return `Access-Control-Allow-Credentials: true` with an explicit origin
  (never `*`). Mismatch = cookies silently dropped.
- **CSRF:** with cookie auth, CSRF is a real threat. Backend uses `SameSite=Strict` (or `Lax` min)
  AND expects a CSRF token on state-changing requests (Spring Security default). Frontend echoes it.
- **Never log auth headers or response bodies** that may carry session metadata.

### Hurdle H1 — Cross-origin HttpOnly cookies in dev

In dev, frontend is `http://localhost:4200` and backend `http://localhost:8080`: browsers treat
these as **same-site but different-origin**, so cookies need explicit credentials handling.

- **Frontend:** every `HttpClient` call that needs the session cookie must send `withCredentials: true`
  (via the interceptor once non-auth endpoints are wired).
- **Backend (for reference):** CORS must allow the frontend origin explicitly (not `*`) with
  `allowCredentials = true`; cookie set `HttpOnly`, `Secure` (prod), `SameSite=Lax` (dev) or
  `SameSite=None; Secure` (cross-site prod); CSRF filter issues a readable cookie + expects a header echo.
- **Symptom when misconfigured:** the browser sends the request without the cookie, backend returns
  401, and `withCredentials` looks broken. The fix is always CORS + `Access-Control-Allow-Credentials`
  on the backend.

### No Refresh Token (by design)

**Decision:** there is no refresh-token flow. Session TTL is controlled entirely by the backend
cookie's expiration. When the session expires, the user gets a 401 and must log in again — the
frontend does not attempt silent renewal.

- **Why:** fewer moving parts, no refresh-token storage or rotation logic to secure, and a smaller
  attack surface overall. This matches the project's current stage — a long-lived-session UX isn't
  a real requirement yet, so building for it now would be speculative.
- **Revisit when:** the session TTL is found to be too short for real user workflows, or the project
  grows into a scenario that genuinely needs long-lived sessions (e.g. persistent mobile clients).
  Until then, treat "add a refresh token" as YAGNI.

## 2. XSS Prevention

- **Trust Angular's default sanitization.** `{{ interpolation }}` and `[property]` binding are safe.
- **Never use `[innerHTML]` with user content** unless passed through
  `DomSanitizer.sanitize(SecurityContext.HTML, ...)`.
- **Never call `bypassSecurityTrust*`** unless the source is 100% server-controlled and code-reviewed.
  Each call is a permanent liability — document why.
- Audit every `ElementRef.nativeElement` access that writes to the DOM.
- Do not concatenate user input into URLs, style attributes, or event handlers.

## 3. Input Validation

- **Validate on client AND server.** Client validation is UX; server validation is security.
  Never trust client-only validation.
- Use strict validators on every `FormControl`: `required`, `email`, length limits, patterns.
- **Never build URLs or API paths from user input** without explicit allowlisting.
- Strip or reject unexpected characters at form boundaries.

## 4. HTTP / Network

- **HTTPS only in production.** `environment.ts` must use `https://`.
- **Two functional interceptors** (`HttpInterceptorFn`) registered in `app.config.ts`:
  - `credentialsInterceptor` — adds `withCredentials: true` to every request targeting
    `environment.apiBaseUrl`. Never add `withCredentials` manually per request.
  - `errorInterceptor` — catches `HttpErrorResponse`: 401 → redirect to `/auth`; everything else → propagate.
- **401:** session cookie expired or missing → redirect to `/auth`. Nothing to clear frontend-side.
- **403:** propagate; the component decides how to surface it.
- **5xx:** propagate; show a generic user-facing message at the component level, never internals.
- **Never swallow errors silently.** Every intercepted error reaches the caller via `throwError(() => error)`.

## 5. Routing / Open Redirect

- **Never `router.navigate()` or `window.location =` with raw user input.**
- `returnUrl` query params must be validated as **same-origin relative paths only**
  (reject `https://evil.com/...` and `//evil.com/...`).
- Apply the `authGuard` (`canActivate`) to every protected route.

## 6. Dependencies

- Run `npm audit` before each feature merge. Address high/critical before deploying.
- Prefer well-maintained libraries (recent release, active maintainers, no open CVEs).
- Pin exact versions for critical dependencies. Don't pull a dependency for a one-line utility.

## 7. Secrets

- **Never commit secrets** (keys, tokens, passwords, signing keys).
- `environment.ts` is for **non-secret public config only** (public API URL, feature flags).
- Real secrets live in the backend or CI/CD vaults — never bundled into the Angular app (the bundle is public).

## 8. Content Security Policy (production, set at the hosting layer)

- `default-src 'self'`
- `script-src 'self'` (no `'unsafe-inline'`, no `'unsafe-eval'`)
- `connect-src 'self' https://gymtrack-83nr.onrender.com`
- `img-src 'self' data: https:`
- `style-src 'self' 'unsafe-inline'` (Tailwind runtime; tighten if feasible)
- `frame-ancestors 'none'` (clickjacking protection)

## 9. Logging & Telemetry

- **Never log PII** (email, name, phone, address) in client-side logs.
- **Never log tokens, passwords, or headers.**
- Scrub sensitive fields from error objects before sending to any monitoring service.

## 10. Security Checklist — Before Every PR Merge

- [ ] No new `any` types
- [ ] No `bypassSecurityTrust*` added (or justified + reviewed)
- [ ] No `[innerHTML]` with user-provided data
- [ ] No hardcoded URLs / secrets / credentials
- [ ] No `Authorization: Bearer` header injection (cookies only)
- [ ] Session data never logged
- [ ] New protected routes have `authGuard`
- [ ] User input validated on client (UX) and assumed validated on server (security)
- [ ] `npm audit` shows no NEW high/critical issues
- [ ] Error messages do not leak backend internals