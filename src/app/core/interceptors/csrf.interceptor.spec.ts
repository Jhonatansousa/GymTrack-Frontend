import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { csrfInterceptor } from './csrf.interceptor';

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    document.cookie = 'XSRF-TOKEN=test-csrf-token-123';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  });

  it('should attach the X-XSRF-TOKEN header with the cookie value on a POST request', () => {
    http.post(`${environment.apiBaseUrl}/divisions`, { name: 'Push' }).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions`);
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('test-csrf-token-123');

    req.flush({});
  });
});
