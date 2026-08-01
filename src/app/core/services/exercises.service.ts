import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Exercise, ExerciseResponse, ExercisesResponse } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/exercises`;

  getByDivision(divisionId: number): Observable<Exercise[]> {
    return this.http
      .get<ExercisesResponse>(`${this.baseUrl}/${divisionId}`)
      .pipe(map((response) => response.results));
  }

  create(name: string, workoutDivisionId: number): Observable<Exercise> {
    return this.http
      .post<ExerciseResponse>(this.baseUrl, { name, workoutDivisionId })
      .pipe(map((response) => response.results));
  }

  update(id: number, newName: string): Observable<Exercise> {
    return this.http
      .patch<ExerciseResponse>(`${this.baseUrl}/${id}`, { newName })
      .pipe(map((response) => response.results));
  }
}
