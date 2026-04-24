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
