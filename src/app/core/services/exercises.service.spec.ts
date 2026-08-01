import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Exercise } from '../models/exercise.model';
import { ExercisesService } from './exercises.service';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExercisesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getByDivision', () => {
    it('should GET /exercises/:divisionId and map exerciseId/exerciseName to id/name', () => {
      let emitted: Exercise[] | undefined;

      service.getByDivision(1).subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/exercises/1`);
      expect(req.request.method).toBe('GET');

      req.flush({
        status: 'SUCCESS',
        results: [
          { exerciseId: 101, exerciseName: 'Supino Reto', workoutDivisionId: 1 },
          { exerciseId: 102, exerciseName: 'Crucifixo', workoutDivisionId: 1 },
        ],
      });

      expect(emitted).toEqual([
        { id: 101, name: 'Supino Reto', workoutDivisionId: 1 },
        { id: 102, name: 'Crucifixo', workoutDivisionId: 1 },
      ]);
    });
  });

  describe('create', () => {
    it('should POST /exercises with the name and division id, and map the created exercise', () => {
      let emitted: Exercise | undefined;

      service.create('Supino Reto', 1).subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/exercises`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Supino Reto', workoutDivisionId: 1 });

      req.flush({
        status: 'SUCCESS',
        results: { exerciseId: 101, exerciseName: 'Supino Reto', workoutDivisionId: 1 },
      });

      expect(emitted).toEqual({ id: 101, name: 'Supino Reto', workoutDivisionId: 1 });
    });
  });

  describe('update', () => {
    it('should PATCH /exercises/:id with the new name (backend returns no updated resource)', () => {
      let completed = false;

      service.update(101, 'Supino Reto com Halteres').subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/exercises/101`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ newExerciseName: 'Supino Reto com Halteres' });

      req.flush({ status: 'SUCCESS' });

      expect(completed).toBe(true);
    });
  });

  describe('remove', () => {
    it('should DELETE /exercises/:id', () => {
      let completed = false;

      service.remove(101).subscribe(() => (completed = true));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/exercises/101`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});
