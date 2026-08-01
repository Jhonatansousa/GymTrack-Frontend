import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Exercise } from '../../core/models/exercise.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { ExercisesService } from '../../core/services/exercises.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ExerciseFormComponent } from './components/exercise-form/exercise-form.component';
import { ExerciseRowComponent } from './components/exercise-row/exercise-row.component';

@Component({
  selector: 'app-exercises',
  imports: [ConfirmDialogComponent, ExerciseFormComponent, ExerciseRowComponent],
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

      <div class="flex items-start justify-between gap-4">
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
        <button
          type="button"
          data-testid="add-exercise-button"
          (click)="openForm()"
          class="inline-flex items-center gap-2 rounded bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          Adicionar Exercício
        </button>
      </div>

      @if (exercises().length > 0) {
        <div class="flex flex-col gap-2.5">
          @for (exercise of exercises(); track exercise.id; let i = $index) {
            <app-exercise-row
              [exercise]="exercise"
              [index]="i"
              (edit)="openEditForm(exercise)"
              (remove)="askDeleteExercise(exercise)"
            />
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

      @if (isFormOpen()) {
        <app-exercise-form
          [heading]="editingExercise() ? 'Editar Exercício' : 'Novo Exercício'"
          [submitLabel]="editingExercise() ? 'Salvar' : 'Criar'"
          [initialName]="editingExercise()?.name ?? ''"
          [errorMessage]="formError()"
          [isSubmitting]="isSubmitting()"
          (save)="onSubmitForm($event)"
          (cancelled)="closeForm()"
        />
      }

      @if (exerciseToDelete(); as exercise) {
        <app-confirm-dialog
          title="Excluir exercício"
          [message]="
            'Isso vai apagar o exercício «' +
            exercise.name +
            '» e todas as suas séries. Esta ação não pode ser desfeita.'
          "
          confirmLabel="Excluir"
          [isConfirming]="isDeleting()"
          (confirm)="confirmDelete()"
          (cancelled)="cancelDelete()"
        />
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
  readonly isFormOpen = signal(false);
  readonly formError = signal('');
  readonly isSubmitting = signal(false);
  readonly editingExercise = signal<Exercise | null>(null);
  readonly exerciseToDelete = signal<Exercise | null>(null);
  readonly isDeleting = signal(false);

  private readonly divisionId = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    // Read eagerly: getCurrentNavigation() only returns the in-flight navigation while
    // this component is being activated by the router, not after activation completes.
    const stateDivisionName = this.router.getCurrentNavigation()?.extras.state?.[
      'divisionName'
    ] as string | undefined;

    if (stateDivisionName) {
      this.divisionName.set(stateDivisionName);
    } else {
      this.divisionsService.getById(this.divisionId).subscribe({
        next: (division) => this.divisionName.set(division.name),
      });
    }

    this.loadExercises();
  }

  onBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  openForm(): void {
    this.editingExercise.set(null);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  openEditForm(exercise: Exercise): void {
    this.editingExercise.set(exercise);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingExercise.set(null);
  }

  onSubmitForm(name: string): void {
    const editing = this.editingExercise();
    const request = editing
      ? this.exercisesService.update(editing.id, name)
      : this.exercisesService.create(name, this.divisionId);

    this.formError.set('');
    this.isSubmitting.set(true);
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeForm();
        this.loadExercises();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.formError.set(this.mapFormError(error));
      },
    });
  }

  askDeleteExercise(exercise: Exercise): void {
    this.exerciseToDelete.set(exercise);
  }

  cancelDelete(): void {
    this.exerciseToDelete.set(null);
  }

  confirmDelete(): void {
    const exercise = this.exerciseToDelete();
    if (!exercise) return;

    this.isDeleting.set(true);
    this.exercisesService.remove(exercise.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.exerciseToDelete.set(null);
        this.loadExercises();
      },
      error: () => this.isDeleting.set(false),
    });
  }

  private mapFormError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 409:
        return 'Já existe um exercício com esse nome.';
      default:
        return 'Não foi possível salvar o exercício. Tente novamente.';
    }
  }

  private loadExercises(): void {
    this.exercisesService.getByDivision(this.divisionId).subscribe({
      next: (exercises) => this.exercises.set(exercises),
    });
  }
}
