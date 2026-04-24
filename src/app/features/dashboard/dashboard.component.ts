import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <p data-testid="dashboard-welcome" class="text-sm">Bem-vindo!</p>
    </section>
  `,
})
export class DashboardComponent {}
