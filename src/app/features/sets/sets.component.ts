import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkoutSet } from '../../core/models/workout-set.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { ExercisesService } from '../../core/services/exercises.service';
import { SetsService } from '../../core/services/sets.service';
import { SetCardComponent } from './components/set-card/set-card.component';

@Component({
  selector: 'app-sets',
  imports: [SetCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <button
        type="button"
        data-testid="back-to-exercises-button"
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
        {{ divisionName() }}
      </button>

      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            data-testid="sets-eyebrow"
            class="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
          >
            Exercício
          </p>
          <h1
            data-testid="sets-heading"
            class="font-serif text-3xl font-semibold tracking-tight text-text"
          >
            {{ exerciseName() }}
          </h1>
        </div>
      </div>

      @if (loadError()) {
        <div
          data-testid="sets-load-error"
          class="rounded-md border border-error/40 bg-error/10 px-6 py-14 text-center"
        >
          <p class="text-sm text-error">Não foi possível carregar as séries. Tente novamente.</p>
        </div>
      } @else if (sets().length > 0) {
        <div class="flex flex-col gap-2.5">
          @for (set of sets(); track set.id; let i = $index) {
            <app-set-card [set]="set" [index]="i" />
          }
        </div>
      } @else {
        <div
          data-testid="sets-empty"
          class="rounded-md border border-border bg-surface px-6 py-14 text-center"
        >
          <p class="text-sm text-text-muted">
            Nenhuma série cadastrada ainda. Toque em "Adicionar Série" para começar.
          </p>
        </div>
      }
    </section>
  `,
})
export class SetsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly divisionsService = inject(DivisionsService);
  private readonly exercisesService = inject(ExercisesService);
  private readonly setsService = inject(SetsService);

  readonly divisionName = signal('');
  readonly exerciseName = signal('');
  readonly sets = signal<WorkoutSet[]>([]);
  readonly loadError = signal(false);

  private readonly divisionId = Number(this.route.snapshot.paramMap.get('divisionId'));
  private readonly exerciseId = Number(this.route.snapshot.paramMap.get('exerciseId'));

  constructor() {
    // Read eagerly: getCurrentNavigation() only returns the in-flight navigation while
    // this component is being activated by the router, not after activation completes.
    const state = this.router.getCurrentNavigation()?.extras.state as
      | { divisionName?: string; exerciseName?: string }
      | undefined;

    if (state?.divisionName && state?.exerciseName) {
      this.divisionName.set(state.divisionName);
      this.exerciseName.set(state.exerciseName);
    } else {
      this.divisionsService.getById(this.divisionId).subscribe({
        next: (division) => this.divisionName.set(division.name),
      });
      this.exercisesService.getByDivision(this.divisionId).subscribe({
        next: (exercises) => {
          const exercise = exercises.find((e) => e.id === this.exerciseId);
          if (exercise) this.exerciseName.set(exercise.name);
        },
      });
    }

    this.loadSets();
  }

  onBack(): void {
    void this.router.navigate(['/dashboard/divisions', this.divisionId, 'exercises']);
  }

  private loadSets(): void {
    this.loadError.set(false);
    this.setsService.getByExercise(this.exerciseId).subscribe({
      next: (sets) => this.sets.set(sets),
      error: () => this.loadError.set(true),
    });
  }
}
