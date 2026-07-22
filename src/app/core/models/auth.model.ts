export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// With HttpOnly cookies, the auth token is set via Set-Cookie and is never read by JS.
// The response body is typed as opaque to discourage client-side token access.
export interface AuthResponse {
  results: unknown;
}

// Non-sensitive identity returned by GET /auth/me. Never carries the token (that stays
// in the HttpOnly cookie) — only public profile fields safe to render in the UI.
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface CurrentUserResponse {
  results: AuthenticatedUser;
}
