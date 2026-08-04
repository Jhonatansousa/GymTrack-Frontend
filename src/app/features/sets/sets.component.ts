import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, groupBy, mergeMap } from 'rxjs';

import { WorkoutSet } from '../../core/models/workout-set.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { ExercisesService } from '../../core/services/exercises.service';
import { SetsService } from '../../core/services/sets.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { SetCardComponent } from './components/set-card/set-card.component';
import { SetsHeaderComponent } from './components/sets-header/sets-header.component';

@Component({
  selector: 'app-sets',
  imports: [ConfirmDialogComponent, SetCardComponent, SetsHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <app-sets-header
        [divisionName]="divisionName()"
        [exerciseName]="exerciseName()"
        [isCreating]="isCreating()"
        [weightIncrement]="weightIncrement()"
        (back)="onBack()"
        (addSet)="onAddSet()"
        (weightIncrementSelected)="onWeightIncrementSelected($event)"
      />

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
            <app-set-card
              [set]="set"
              [index]="i"
              [weightIncrement]="weightIncrement()"
              (rename)="onRenameSet(set, $event)"
              (remove)="askDeleteSet(set)"
              (weightChange)="onWeightChange(set, $event)"
              (repsChange)="onRepsChange(set, $event)"
            />
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

      @if (setToDelete(); as set) {
        <app-confirm-dialog
          title="Excluir série"
          [message]="'Isso vai apagar a série «' + set.name + '». Esta ação não pode ser desfeita.'"
          confirmLabel="Excluir"
          [isConfirming]="isDeleting()"
          (confirm)="confirmDelete()"
          (cancelled)="cancelDelete()"
        />
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
  readonly isCreating = signal(false);
  readonly setToDelete = signal<WorkoutSet | null>(null);
  readonly isDeleting = signal(false);
  readonly weightIncrement = signal(2.5);

  private readonly divisionId = Number(this.route.snapshot.paramMap.get('divisionId'));
  private readonly exerciseId = Number(this.route.snapshot.paramMap.get('exerciseId'));
  private readonly pendingUpdate = new Subject<number>();

  constructor() {
    // One debounce timer per set id (groupBy), so editing set A never resets set B's timer.
    this.pendingUpdate
      .pipe(
        groupBy((setId) => setId),
        mergeMap((group) => group.pipe(debounceTime(500))),
        takeUntilDestroyed(),
      )
      .subscribe((setId) => this.persistSet(setId));

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

  onAddSet(): void {
    if (this.isCreating()) return;

    this.isCreating.set(true);
    this.setsService.create(this.exerciseId).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.loadSets();
      },
      error: () => this.isCreating.set(false),
    });
  }

  onRenameSet(set: WorkoutSet, newName: string): void {
    this.setsService.update(set.id, { newName }).subscribe({
      next: () => this.loadSets(),
    });
  }

  onWeightIncrementSelected(value: number): void {
    this.weightIncrement.set(value);
  }

  onWeightChange(set: WorkoutSet, weight: number): void {
    this.patchSetLocally(set.id, { weight });
    this.pendingUpdate.next(set.id);
  }

  onRepsChange(set: WorkoutSet, reps: number): void {
    this.patchSetLocally(set.id, { reps });
    this.pendingUpdate.next(set.id);
  }

  askDeleteSet(set: WorkoutSet): void {
    this.setToDelete.set(set);
  }

  cancelDelete(): void {
    this.setToDelete.set(null);
  }

  confirmDelete(): void {
    const set = this.setToDelete();
    if (!set) return;

    this.isDeleting.set(true);
    this.setsService.remove(set.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.setToDelete.set(null);
        this.loadSets();
      },
      error: () => this.isDeleting.set(false),
    });
  }

  private loadSets(): void {
    this.loadError.set(false);
    this.setsService.getByExercise(this.exerciseId).subscribe({
      next: (sets) => this.sets.set(sets),
      error: () => this.loadError.set(true),
    });
  }

  private patchSetLocally(setId: number, changes: Partial<Pick<WorkoutSet, 'reps' | 'weight'>>): void {
    this.sets.update((sets) => sets.map((s) => (s.id === setId ? { ...s, ...changes } : s)));
  }

  private persistSet(setId: number): void {
    const set = this.sets().find((s) => s.id === setId);
    if (!set) return;

    this.setsService
      .update(setId, { reps: set.reps, weight: set.weight })
      .subscribe({ error: () => this.loadSets() });
  }
}
