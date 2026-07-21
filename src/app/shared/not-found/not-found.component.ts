import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-sm flex-col items-center gap-4 p-4 text-center">
      <h1 class="text-xl font-semibold text-text">Página não encontrada</h1>
      <p data-testid="not-found-message" class="text-sm text-text-muted">
        A página não encontrada. Verifique o endereço digitado.
      </p>
      <a
        data-testid="not-found-back-link"
        [routerLink]="['/auth']"
        class="font-sans text-sm text-text-muted underline-offset-4 transition-colors duration-150 hover:text-text hover:underline"
      >
        Voltar para o início
      </a>
    </section>
  `,
})
export class NotFoundComponent {}
