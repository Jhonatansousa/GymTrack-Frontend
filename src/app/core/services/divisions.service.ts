import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Division, DivisionResponse, DivisionsResponse } from '../models/division.model';

@Injectable({ providedIn: 'root' })
export class DivisionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/divisions`;

  getAll(): Observable<Division[]> {
    return this.http.get<DivisionsResponse>(this.baseUrl).pipe(map((response) => response.results));
  }

  create(name: string): Observable<Division> {
    return this.http
      .post<DivisionResponse>(this.baseUrl, { name })
      .pipe(map((response) => response.results));
  }

  update(id: number, newName: string): Observable<Division> {
    return this.http
      .patch<DivisionResponse>(`${this.baseUrl}/${id}`, { newName })
      .pipe(map((response) => response.results));
  }
}
