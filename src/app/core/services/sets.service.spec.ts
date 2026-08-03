import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { WorkoutSet } from '../models/workout-set.model';
import { SetsService } from './sets.service';

describe('SetsService', () => {
  let service: SetsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SetsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getByExercise', () => {
    it('should GET /sets/:exerciseId and map exerciseSetId/setName to id/name', () => {
      let emitted: WorkoutSet[] | undefined;

      service.getByExercise(101).subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/sets/101`);
      expect(req.request.method).toBe('GET');

      req.flush({
        status: 'SUCCESS',
        results: [
          { exerciseSetId: 1001, setName: '1', reps: 10, weight: 60, exerciseId: 101 },
          { exerciseSetId: 1002, setName: '2', reps: 8, weight: 70, exerciseId: 101 },
        ],
      });

      expect(emitted).toEqual([
        { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 },
        { id: 1002, name: '2', reps: 8, weight: 70, exerciseId: 101 },
      ]);
    });
  });

  describe('create', () => {
    it('should POST /sets with only the exerciseId, letting the backend auto-name the set', () => {
      let emitted: WorkoutSet | undefined;

      service.create(101).subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/sets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ exerciseId: 101 });

      req.flush({
        status: 'SUCCESS',
        results: { exerciseSetId: 1001, setName: '1', reps: 0, weight: 0, exerciseId: 101 },
      });

      expect(emitted).toEqual({ id: 1001, name: '1', reps: 0, weight: 0, exerciseId: 101 });
    });
  });

  describe('update', () => {
    it('should PATCH /sets/:id with only reps and weight, leaving the name untouched', () => {
      let completed = false;

      service.update(1001, { reps: 12, weight: 70 }).subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/sets/1001`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ reps: 12, weight: 70 });

      req.flush({ status: 'SUCCESS' });

      expect(completed).toBe(true);
    });

    it('should PATCH /sets/:id with only newName, leaving reps and weight untouched', () => {
      let completed = false;

      service.update(1001, { newName: 'Aquecimento' }).subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/sets/1001`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ newName: 'Aquecimento' });

      req.flush({ status: 'SUCCESS' });

      expect(completed).toBe(true);
    });
  });

  describe('remove', () => {
    it('should DELETE /sets/:id', () => {
      let completed = false;

      service.remove(1001).subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/sets/1001`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});
