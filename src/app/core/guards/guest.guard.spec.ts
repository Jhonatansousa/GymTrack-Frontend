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
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  function runGuard(): Observable<boolean | UrlTree> {
    return TestBed.runInInjectionContext(() =>
      guestGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;
  }

  it('should return true when session check fails (guest user)', () => {
    let result: boolean | UrlTree | undefined;

    runGuard().subscribe((v) => (result = v));
    httpTesting
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(result).toBe(true);
  });

  it('should return a UrlTree to /dashboard when session check succeeds (authenticated user)', () => {
    let result: boolean | UrlTree | undefined;

    runGuard().subscribe((v) => (result = v));
    httpTesting.expectOne(`${environment.apiBaseUrl}/auth/me`).flush({ results: {} });

    expect(result).toEqual(router.createUrlTree(['/dashboard']));
  });
});
