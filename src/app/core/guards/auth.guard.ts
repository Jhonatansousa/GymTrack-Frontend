import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(AuthService).checkSession().pipe(
    map(() => true),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return of(router.createUrlTree(['/auth']));
      }
      return of(router.createUrlTree(['/auth'], { queryParams: { sessionCheckFailed: 'true' } }));
    }),
  );
};
