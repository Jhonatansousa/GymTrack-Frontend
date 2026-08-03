import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth',
    },
    {
        path: 'auth',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'auth/register',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent
            ),
    },
    {
        path: 'dashboard/divisions/:divisionId/exercises',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/exercises/exercises.component').then(
                (m) => m.ExercisesComponent
            ),
    },
    {
        path: 'dashboard/divisions/:divisionId/exercises/:exerciseId/sets',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/sets/sets.component').then(
                (m) => m.SetsComponent
            ),
    },
    {
        path: '**',
        loadComponent: () =>
            import('./shared/not-found/not-found.component').then(
                (m) => m.NotFoundComponent
            ),
    },
];
