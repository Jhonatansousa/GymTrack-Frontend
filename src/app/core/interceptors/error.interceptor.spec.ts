import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should redirect to /auth on 401 Unauthorized', () => {
    http.get('/test').subscribe({ error: vi.fn() });
    httpTesting.expectOne('/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
  });

  it('should propagate the error after redirecting on 401', () => {
    let receivedError: unknown;

    http.get('/test').subscribe({ error: (err) => { receivedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toBeTruthy();
  });

  it('should NOT redirect on 403 Forbidden', () => {
    http.get('/test').subscribe({ error: vi.fn() });
    httpTesting.expectOne('/test').flush({}, { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should NOT redirect on 5xx errors', () => {
    http.get('/test').subscribe({ error: vi.fn() });
    httpTesting.expectOne('/test').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should propagate non-401 errors', () => {
    let receivedError: unknown;

    http.get('/test').subscribe({ error: (err) => { receivedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(receivedError).toBeTruthy();
  });
});
