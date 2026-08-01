import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Exercise } from '../../core/models/exercise.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { ExercisesService } from '../../core/services/exercises.service';
import { ExerciseRowComponent } from './components/exercise-row/exercise-row.component';

@Component({
  selector: 'app-exercises',
  imports: [ExerciseRowComponent],
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

      @if (exercises().length > 0) {
        <div class="flex flex-col gap-2.5">
          @for (exercise of exercises(); track exercise.id; let i = $index) {
            <app-exercise-row [exercise]="exercise" [index]="i" />
          }
        </div>
      } @else {
        <div
          data-testid="exercises-empty"
          class="rounded-md border border-border bg-surface px-6 py-14 text-center"
        >
          <p class="text-sm text-text-muted">Nenhum exercício cadastrado nesta divisão ainda.</p>
        </div>
      }
    </section>
  `,
})
export class ExercisesComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly divisionsService = inject(DivisionsService);
  private readonly exercisesService = inject(ExercisesService);

  readonly divisionName = signal('');
  readonly exercises = signal<Exercise[]>([]);

  constructor() {
    const divisionId = Number(this.route.snapshot.paramMap.get('id'));

    // Read eagerly: getCurrentNavigation() only returns the in-flight navigation while
    // this component is being activated by the router, not after activation completes.
    const stateDivisionName = this.router.getCurrentNavigation()?.extras.state?.[
      'divisionName'
    ] as string | undefined;

    if (stateDivisionName) {
      this.divisionName.set(stateDivisionName);
    } else {
      this.divisionsService.getById(divisionId).subscribe({
        next: (division) => this.divisionName.set(division.name),
      });
    }

    this.exercisesService.getByDivision(divisionId).subscribe({
      next: (exercises) => this.exercises.set(exercises),
    });
  }

  onBack(): void {
    void this.router.navigate(['/dashboard']);
  }
}
