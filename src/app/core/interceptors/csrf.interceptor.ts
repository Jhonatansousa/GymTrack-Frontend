import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function readCsrfToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl) || !STATE_CHANGING_METHODS.includes(req.method)) {
    return next(req);
  }

  const token = readCsrfToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ headers: req.headers.set(CSRF_HEADER_NAME, token) }));
};
