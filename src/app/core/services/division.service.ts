import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../enviroments/environment.development';
import { APIResponse } from '../models/auth.model';
import {
  DivisionUpdateDTO,
  WorkoutDivisionDTO,
  WorkoutDivisionResponseDTO,
} from '../models/division.model';

@Injectable({
  providedIn: 'root',
})
export class DivisionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/divisions`;

  private divisionsSignal = signal<WorkoutDivisionResponseDTO[]>([]);
  divisions = computed(() => this.divisionsSignal());

  loadDivisions(): Observable<WorkoutDivisionResponseDTO[]> {
    return this.http
      .get<APIResponse<WorkoutDivisionResponseDTO[]>>(this.apiUrl)
      .pipe(
        map((response) => response.results ?? []),
        tap((divisions) => this.divisionsSignal.set(divisions))
      );
  }

  createDivision(
    payload: WorkoutDivisionDTO
  ): Observable<WorkoutDivisionResponseDTO> {
    return this.http
      .post<APIResponse<WorkoutDivisionResponseDTO>>(this.apiUrl, payload)
      .pipe(
        map((response) => response.results as WorkoutDivisionResponseDTO),
        tap((createdDivision) => {
          this.divisionsSignal.update((current) => [createdDivision, ...current]);
        })
      );
  }

  updateDivision(
    id: number,
    payload: DivisionUpdateDTO
  ): Observable<WorkoutDivisionResponseDTO> {
    return this.http
      .patch<APIResponse<WorkoutDivisionResponseDTO>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map((response) => response.results as WorkoutDivisionResponseDTO),
        tap((updatedDivision) => {
          this.divisionsSignal.update((current) =>
            current.map((division) =>
              division.id === id ? { ...division, ...updatedDivision } : division
            )
          );
        })
      );
  }

  deleteDivision(id: number): Observable<void> {
    return this.http.delete<APIResponse<unknown>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.divisionsSignal.update((current) =>
          current.filter((division) => division.id !== id)
        );
      })
    );
  }
}
