import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const currentUrl = router.url;
        const returnUrlParams = currentUrl.startsWith('/auth')
          ? {}
          : { queryParams: { returnUrl: currentUrl } };
        void router.navigate(['/auth'], { replaceUrl: true, ...returnUrlParams });
      }
      return throwError(() => error);
    }),
  );
};
