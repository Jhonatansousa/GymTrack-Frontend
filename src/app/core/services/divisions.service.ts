import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Division, DivisionsResponse } from '../models/division.model';

@Injectable({ providedIn: 'root' })
export class DivisionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/divisions`;

  getAll(): Observable<Division[]> {
    return this.http.get<DivisionsResponse>(this.baseUrl).pipe(map((response) => response.results));
  }
}
