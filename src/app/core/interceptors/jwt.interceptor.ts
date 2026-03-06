import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor JWT funcional
 * Anexa o token JWT do localStorage ao cabeçalho Authorization de todas as requisições HTTP
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Busca o token do localStorage
  const token = localStorage.getItem('jwt_token');

  // Se o token existir, clona a requisição e adiciona o cabeçalho Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Passa a requisição (modificada ou não) para o próximo handler
  return next(req);
};
