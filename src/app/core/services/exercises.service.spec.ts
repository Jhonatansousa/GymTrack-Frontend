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
    it('should GET /exercises/:divisionId and emit the exercises from the response envelope', () => {
      const exercises: Exercise[] = [
        { id: 101, name: 'Supino Reto', workoutDivisionId: 1 },
        { id: 102, name: 'Crucifixo', workoutDivisionId: 1 },
      ];
      let emitted: Exercise[] | undefined;

      service.getByDivision(1).subscribe((result) => (emitted = result));

      const req = httpTesting.expectOne(`${environment.apiBaseUrl}/exercises/1`);
      expect(req.request.method).toBe('GET');

      req.flush({ results: exercises });

      expect(emitted).toEqual(exercises);
    });
  });
});
