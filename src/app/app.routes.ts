import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { authGuard } from './core/guards/auth.guard';
import { DivisionsListComponent } from './features/divisions/divisions-list/divisions-list.component';
import { ExercisesPageComponent } from './features/exercises/exercises-page/exercises-page.component';

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
        component: DivisionsListComponent,
      },
      {
        path: 'divisions/:divisionId/exercises',
        component: ExercisesPageComponent,
      },
    ],
  },

  // Fallback global — redireciona rota desconhecida para login
  {
    path: '**',
    redirectTo: 'login',
  },
];
