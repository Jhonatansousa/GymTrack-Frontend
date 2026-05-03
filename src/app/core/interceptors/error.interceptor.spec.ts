import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
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
    vi.restoreAllMocks();
  });

  it('should redirect to /auth with replaceUrl:true and propagate HttpErrorResponse on 401', () => {
    let capturedError: unknown;

    http.get('/test').subscribe({ error: (err) => { capturedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledExactlyOnceWith(['/auth'], { replaceUrl: true });
    expect(capturedError).toBeInstanceOf(HttpErrorResponse);
    expect((capturedError as HttpErrorResponse).status).toBe(401);
  });

  it('should propagate HttpErrorResponse on 403 without redirecting', () => {
    let capturedError: unknown;

    http.get('/test').subscribe({ error: (err) => { capturedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(capturedError).toBeInstanceOf(HttpErrorResponse);
    expect((capturedError as HttpErrorResponse).status).toBe(403);
  });

  it('should propagate HttpErrorResponse on 409 without redirecting', () => {
    let capturedError: unknown;

    http.get('/test').subscribe({ error: (err) => { capturedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 409, statusText: 'Conflict' });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(capturedError).toBeInstanceOf(HttpErrorResponse);
    expect((capturedError as HttpErrorResponse).status).toBe(409);
  });

  it('should propagate HttpErrorResponse on 500 without redirecting', () => {
    let capturedError: unknown;

    http.get('/test').subscribe({ error: (err) => { capturedError = err; } });
    httpTesting.expectOne('/test').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(capturedError).toBeInstanceOf(HttpErrorResponse);
    expect((capturedError as HttpErrorResponse).status).toBe(500);
  });
});
