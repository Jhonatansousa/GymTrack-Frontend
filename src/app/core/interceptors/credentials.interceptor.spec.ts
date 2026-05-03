import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add withCredentials: true to requests targeting the API base URL', () => {
    http.get(`${environment.apiBaseUrl}/divisions`).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions`);
    expect(req.request.withCredentials).toBe(true);

    req.flush([]);
  });

  it('should NOT add withCredentials to requests targeting external URLs', () => {
    http.get('https://external.example.com/data').subscribe();

    const req = httpTesting.expectOne('https://external.example.com/data');
    expect(req.request.withCredentials).toBe(false);

    req.flush({});
  });
});
