import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment.development';
import { APIResponse } from '../models/auth.model';
import {
  ExerciseDTO,
  ExerciseResponseDTO,
  ExerciseUpdateDTO,
} from '../models/exercise.model';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/exercises`;

  getByDivision(divisionId: number): Observable<ExerciseResponseDTO[]> {
    return this.http
      .get<APIResponse<ExerciseResponseDTO[]>>(`${this.apiUrl}/${divisionId}`)
      .pipe(map((response) => response.results ?? []));
  }

  create(payload: ExerciseDTO): Observable<ExerciseResponseDTO> {
    return this.http
      .post<APIResponse<ExerciseResponseDTO>>(this.apiUrl, payload)
      .pipe(map((response) => response.results as ExerciseResponseDTO));
  }

  update(
    exerciseId: number,
    payload: ExerciseUpdateDTO
  ): Observable<ExerciseResponseDTO> {
    return this.http
      .patch<APIResponse<ExerciseResponseDTO>>(
        `${this.apiUrl}/${exerciseId}`,
        payload
      )
      .pipe(map((response) => response.results as ExerciseResponseDTO));
  }

  delete(exerciseId: number): Observable<void> {
    return this.http
      .delete<APIResponse<unknown>>(`${this.apiUrl}/${exerciseId}`)
      .pipe(map(() => void 0));
  }
}
