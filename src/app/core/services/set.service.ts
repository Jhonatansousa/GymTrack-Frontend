import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment.development';
import { APIResponse } from '../models/auth.model';
import {
  ExerciseSetDTO,
  ExerciseSetResponseDTO,
  ExerciseSetUpdateDTO,
} from '../models/set.model';

@Injectable({
  providedIn: 'root',
})
export class SetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sets`;

  getByExercise(exerciseId: number): Observable<ExerciseSetResponseDTO[]> {
    return this.http
      .get<APIResponse<ExerciseSetResponseDTO[]>>(`${this.apiUrl}/${exerciseId}`)
      .pipe(map((response) => response.results ?? []));
  }

  createNewSet(payload: ExerciseSetDTO): Observable<ExerciseSetResponseDTO> {
    return this.http
      .post<APIResponse<ExerciseSetResponseDTO>>(this.apiUrl, payload)
      .pipe(map((response) => response.results as ExerciseSetResponseDTO));
  }

  updateExerciseSet(
    setId: number,
    payload: ExerciseSetUpdateDTO
  ): Observable<ExerciseSetResponseDTO> {
    return this.http
      .patch<APIResponse<ExerciseSetResponseDTO>>(`${this.apiUrl}/${setId}`, payload)
      .pipe(map((response) => response.results as ExerciseSetResponseDTO));
  }

  create(payload: ExerciseSetDTO): Observable<ExerciseSetResponseDTO> {
    return this.createNewSet(payload);
  }

  update(
    setId: number,
    payload: ExerciseSetUpdateDTO
  ): Observable<ExerciseSetResponseDTO> {
    return this.updateExerciseSet(setId, payload);
  }

  delete(setId: number): Observable<void> {
    return this.http
      .delete<APIResponse<unknown>>(`${this.apiUrl}/${setId}`)
      .pipe(map(() => void 0));
  }
}
