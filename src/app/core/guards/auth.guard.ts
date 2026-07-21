import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  return inject(AuthService).checkSession().pipe(
    map(() => true),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return of(router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } }));
      }
      return of(
        router.createUrlTree(['/auth'], {
          queryParams: { returnUrl: state.url, sessionCheckFailed: 'true' },
        }),
      );
    }),
  );
};
