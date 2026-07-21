import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function runGuard(url = '/dashboard'): Observable<boolean | UrlTree> {
    return TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url } as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;
  }

  it('should return true when session check succeeds', () => {
    let result: boolean | UrlTree | undefined;

    runGuard().subscribe((v) => (result = v));
    httpTesting.expectOne(`${environment.apiBaseUrl}/auth/me`).flush({ results: {} });

    expect(result).toBe(true);
  });

  it('should return a UrlTree to /auth with returnUrl when session check returns 401', () => {
    let result: boolean | UrlTree | undefined;

    runGuard('/dashboard/settings').subscribe((v) => (result = v));
    httpTesting
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(result).toEqual(
      router.createUrlTree(['/auth'], { queryParams: { returnUrl: '/dashboard/settings' } }),
    );
  });

  it('should return a UrlTree to /auth with returnUrl and sessionCheckFailed query params when session check fails with a 5xx error', () => {
    let result: boolean | UrlTree | undefined;

    runGuard('/dashboard/settings').subscribe((v) => (result = v));
    httpTesting
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .flush({}, { status: 500, statusText: 'Server Error' });

    expect(result).toEqual(
      router.createUrlTree(['/auth'], {
        queryParams: { returnUrl: '/dashboard/settings', sessionCheckFailed: 'true' },
      }),
    );
  });

  it('should return a UrlTree to /auth with returnUrl and sessionCheckFailed query params when session check fails with a network error', () => {
    let result: boolean | UrlTree | undefined;

    runGuard('/dashboard/settings').subscribe((v) => (result = v));
    httpTesting
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(result).toEqual(
      router.createUrlTree(['/auth'], {
        queryParams: { returnUrl: '/dashboard/settings', sessionCheckFailed: 'true' },
      }),
    );
  });
});
