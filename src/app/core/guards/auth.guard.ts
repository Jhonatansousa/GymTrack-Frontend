import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  return inject(AuthService).checkSession().pipe(
    map(() => true),
    catchError(() => of(false)),
  );
};
