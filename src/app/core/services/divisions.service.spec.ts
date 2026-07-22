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

  describe('create', () => {
    it('should POST /divisions with the name and emit the created division', () => {
      const created: Division = { id: 3, name: 'Pernas' };
      let emitted: Division | undefined;

      service.create('Pernas').subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Pernas' });

      req.flush({ results: created });

      expect(emitted).toEqual(created);
    });
  });

  describe('update', () => {
    it('should PATCH /divisions/:id with the new name and emit the updated division', () => {
      const updated: Division = { id: 5, name: 'Pernas & Glúteos' };
      let emitted: Division | undefined;

      service.update(5, 'Pernas & Glúteos').subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions/5`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ newName: 'Pernas & Glúteos' });

      req.flush({ results: updated });

      expect(emitted).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should DELETE /divisions/:id', () => {
      let completed = false;

      service.remove(7).subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/divisions/7`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});
