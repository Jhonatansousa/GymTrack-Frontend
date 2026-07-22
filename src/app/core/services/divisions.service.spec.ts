import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Division } from '../models/division.model';
import { DivisionsService } from './divisions.service';

describe('DivisionsService', () => {
  let service: DivisionsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DivisionsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /divisions and emit the divisions from the response envelope', () => {
      const divisions: Division[] = [
        { id: 1, name: 'Peito / Tríceps' },
        { id: 2, name: 'Costas / Bíceps' },
      ];
      let emitted: Division[] | undefined;

      service.getAll().subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions`);
      expect(req.request.method).toBe('GET');

      req.flush({ results: divisions });

      expect(emitted).toEqual(divisions);
    });
  });
});
