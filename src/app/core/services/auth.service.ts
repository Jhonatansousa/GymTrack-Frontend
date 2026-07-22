import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, CurrentUserResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

// Render's free-tier instances cold-start after inactivity, taking 30-50s to respond
// to the first request. 60s gives that enough margin while still failing hung requests.
const AUTH_REQUEST_TIMEOUT_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(timeout(AUTH_REQUEST_TIMEOUT_MS));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(timeout(AUTH_REQUEST_TIMEOUT_MS));
  }

  checkSession(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.baseUrl}/me`);
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/logout`, {});
  }
}
