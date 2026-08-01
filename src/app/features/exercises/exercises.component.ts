import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <button
        type="button"
        data-testid="back-to-divisions-button"
        (click)="onBack()"
        class="inline-flex items-center gap-2 self-start text-sm font-medium text-text-muted transition-colors duration-150 hover:text-text"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M9 1.5L3 7L9 12.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Divisões
      </button>

      <div>
        <p
          data-testid="exercises-eyebrow"
          class="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
        >
          Divisão de treino
        </p>
        <h1
          data-testid="exercises-heading"
          class="font-serif text-3xl font-semibold tracking-tight text-text"
        >
          {{ divisionName }}
        </h1>
      </div>
    </section>
  `,
})
export class ExercisesComponent {
  private readonly router = inject(Router);

  // Read eagerly: getCurrentNavigation() only returns the in-flight navigation while
  // this component is being activated by the router, not after activation completes.
  readonly divisionName =
    (this.router.getCurrentNavigation()?.extras.state?.['divisionName'] as string | undefined) ??
    '';

  onBack(): void {
    void this.router.navigate(['/dashboard']);
  }
}
