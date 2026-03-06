import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rotas públicas — sem layout, sem guard
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // Rotas protegidas — dentro do Layout (header + footer)
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'divisions',
        pathMatch: 'full',
      },
      {
        path: 'divisions',
        loadComponent: () =>
          import('./features/divisions/divisions.component').then(
            (m) => m.DivisionsComponent
          ),
      },
    ],
  },

  // Fallback global — redireciona rota desconhecida para login
  {
    path: '**',
    redirectTo: 'login',
  },
];
