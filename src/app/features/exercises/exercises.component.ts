import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DivisionsService } from '../../core/services/divisions.service';

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
          {{ divisionName() }}
        </h1>
      </div>
    </section>
  `,
})
export class ExercisesComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly divisionsService = inject(DivisionsService);

  readonly divisionName = signal('');

  constructor() {
    // Read eagerly: getCurrentNavigation() only returns the in-flight navigation while
    // this component is being activated by the router, not after activation completes.
    const stateDivisionName = this.router.getCurrentNavigation()?.extras.state?.[
      'divisionName'
    ] as string | undefined;

    if (stateDivisionName) {
      this.divisionName.set(stateDivisionName);
      return;
    }

    const divisionId = this.route.snapshot.paramMap.get('id');
    if (divisionId) {
      this.divisionsService.getById(Number(divisionId)).subscribe({
        next: (division) => this.divisionName.set(division.name),
      });
    }
  }

  onBack(): void {
    void this.router.navigate(['/dashboard']);
  }
}
