import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Exercise,
  ExerciseDto,
  ExerciseResponse,
  ExercisesResponse,
} from '../models/exercise.model';

function toExercise(dto: ExerciseDto): Exercise {
  return { id: dto.exerciseId, name: dto.exerciseName, workoutDivisionId: dto.workoutDivisionId };
}

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/exercises`;

  getByDivision(divisionId: number): Observable<Exercise[]> {
    return this.http
      .get<ExercisesResponse>(`${this.baseUrl}/${divisionId}`)
      .pipe(map((response) => response.results.map(toExercise)));
  }

  create(name: string, workoutDivisionId: number): Observable<Exercise> {
    return this.http
      .post<ExerciseResponse>(this.baseUrl, { name, workoutDivisionId })
      .pipe(map((response) => toExercise(response.results)));
  }

  update(id: number, newName: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, { newExerciseName: newName });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
