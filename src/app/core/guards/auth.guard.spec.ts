import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function runGuard(): Observable<boolean> {
    return TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as Observable<boolean>;
  }

  it('should return true when session check succeeds', () => {
    let result: boolean | undefined;

    runGuard().subscribe((v) => (result = v));
    httpTesting.expectOne(`${environment.apiBaseUrl}/auth/me`).flush({ results: {} });

    expect(result).toBe(true);
  });

  it('should return false when session check returns 401', () => {
    let result: boolean | undefined;

    runGuard().subscribe((v) => (result = v));
    httpTesting
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(result).toBe(false);
  });
});
