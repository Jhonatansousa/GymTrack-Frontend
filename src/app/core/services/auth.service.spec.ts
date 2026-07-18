import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest } from '../models/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should POST to /auth/login with the provided credentials', () => {
    const payload: LoginRequest = { email: 'user@mail.com', password: 'Valid@123' };

    service.login(payload).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ results: {} });
  });

  it('should POST to /auth/register with the provided credentials', () => {
    const payload: RegisterRequest = {
      name: 'User Name',
      email: 'user@mail.com',
      password: 'Valid@123',
    };

    service.register(payload).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ results: {} });
  });

  it('should GET /auth/me to check the current session', () => {
    service.checkSession().subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ results: {} });
  });

  it('should POST to /auth/logout', () => {
    service.logout().subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ results: {} });
  });
});
