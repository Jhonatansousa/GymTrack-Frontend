import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExerciseService } from '../../../core/services/exercise.service';
import { ExerciseResponseDTO } from '../../../core/models/exercise.model';
import {
  ExerciseDialogComponent,
  ExerciseDialogData,
} from '../exercise-dialog/exercise-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExerciseSetsListComponent } from '../../sets/exercise-sets-list/exercise-sets-list.component';

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    ExerciseSetsListComponent,
  ],
  templateUrl: './exercises-page.component.html',
  styleUrl: './exercises-page.component.scss',
})
export class ExercisesPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private exerciseService = inject(ExerciseService);
  private dialog = inject(MatDialog);

  divisionId = signal<number | null>(null);
  exercises = signal<ExerciseResponseDTO[]>([]);
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const rawDivisionId = this.route.snapshot.paramMap.get('divisionId');
    const parsedDivisionId = Number(rawDivisionId);

    if (!rawDivisionId || Number.isNaN(parsedDivisionId)) {
      this.hasError.set(true);
      this.errorMessage.set('Divisão inválida.');
      return;
    }

    this.divisionId.set(parsedDivisionId);
    this.loadExercises();
  }

  loadExercises(): void {
    const currentDivisionId = this.divisionId();
    if (currentDivisionId === null) {
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.exerciseService.getByDivision(currentDivisionId).subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Não foi possível carregar os exercícios.');
      },
    });
  }

  openCreateDialog(): void {
    const currentDivisionId = this.divisionId();
    if (currentDivisionId === null) {
      return;
    }

    const dialogRef = this.dialog.open(ExerciseDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result?: { name?: string }) => {
      if (!result?.name) {
        return;
      }

      this.exerciseService
        .create({
          workoutDivisionId: currentDivisionId,
          name: result.name,
        })
        .subscribe({
          next: (createdExercise) => {
            this.exercises.update((current) => [createdExercise, ...current]);
          },
          error: () => {
            this.hasError.set(true);
            this.errorMessage.set('Não foi possível criar o exercício.');
          },
        });
    });
  }

  openEditDialog(exercise: ExerciseResponseDTO, event: Event): void {
    event.stopPropagation();

    const data: ExerciseDialogData = {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
    };

    const dialogRef = this.dialog.open(ExerciseDialogComponent, {
      width: '420px',
      data,
    });

    dialogRef.afterClosed().subscribe((result?: { name?: string }) => {
      if (!result?.name) {
        return;
      }

      this.exerciseService
        .update(exercise.exerciseId, { newExerciseName: result.name })
        .subscribe({
          next: (updatedExercise) => {
            this.exercises.update((current) =>
              current.map((item) =>
                item.exerciseId === exercise.exerciseId ? updatedExercise : item
              )
            );
          },
          error: () => {
            this.hasError.set(true);
            this.errorMessage.set('Não foi possível atualizar o exercício.');
          },
        });
    });
  }

  confirmDelete(exercise: ExerciseResponseDTO, event: Event): void {
    event.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Excluir exercício',
      message:
        'Tem certeza que deseja excluir este exercício? Todas as séries associadas também serão removidas.',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.exerciseService.delete(exercise.exerciseId).subscribe({
        next: () => {
          this.exercises.update((current) =>
            current.filter((item) => item.exerciseId !== exercise.exerciseId)
          );
        },
        error: () => {
          this.hasError.set(true);
          this.errorMessage.set('Não foi possível excluir o exercício.');
        },
      });
    });
  }
}
