import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth',
    },
    {
        path: 'auth',
        loadComponent: () =>
            import('./features/auth/auth-page/auth-page.component').then(
                (m) => m.AuthPageComponent
            ),
    },
];
