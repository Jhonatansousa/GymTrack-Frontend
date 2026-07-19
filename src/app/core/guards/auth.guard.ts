import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(AuthService).checkSession().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/auth']))),
  );
};
