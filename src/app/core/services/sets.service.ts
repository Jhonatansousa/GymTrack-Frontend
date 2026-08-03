import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  WorkoutSet,
  WorkoutSetDto,
  WorkoutSetResponse,
  WorkoutSetsResponse,
  WorkoutSetUpdate,
} from '../models/workout-set.model';

function toWorkoutSet(dto: WorkoutSetDto): WorkoutSet {
  return {
    id: dto.exerciseSetId,
    name: dto.setName,
    reps: dto.reps,
    weight: dto.weight,
    exerciseId: dto.exerciseId,
  };
}

@Injectable({ providedIn: 'root' })
export class SetsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/sets`;

  getByExercise(exerciseId: number): Observable<WorkoutSet[]> {
    return this.http
      .get<WorkoutSetsResponse>(`${this.baseUrl}/${exerciseId}`)
      .pipe(map((response) => response.results.map(toWorkoutSet)));
  }

  create(exerciseId: number): Observable<WorkoutSet> {
    return this.http
      .post<WorkoutSetResponse>(this.baseUrl, { exerciseId })
      .pipe(map((response) => toWorkoutSet(response.results)));
  }

  update(id: number, changes: WorkoutSetUpdate): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, changes);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
