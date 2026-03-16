import { Component, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  ExerciseSetResponseDTO,
  ExerciseSetUpdateDTO,
} from '../../../core/models/set.model';
import { SetService } from '../../../core/services/set.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-set-row',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './set-row.component.html',
  styleUrl: './set-row.component.scss',
})
export class SetRowComponent {
  private setService = inject(SetService);
  private dialog = inject(MatDialog);

  set = input.required<ExerciseSetResponseDTO>();
  deleted = output<number>();
  updated = output<ExerciseSetResponseDTO>();

  isEditingName = signal(false);
  isEditingReps = signal(false);
  isEditingWeight = signal(false);
  isSaving = signal(false);

  currentName = signal('');
  currentReps = signal<number>(0);
  currentWeight = signal<number>(0);

  private syncEffect = effect(() => {
    const currentSet = this.set();
    this.currentName.set(currentSet.setName);
    this.currentReps.set(currentSet.reps);
    this.currentWeight.set(currentSet.weight);
  });

  private syncFromSet(): void {
    const currentSet = this.set();
    this.currentName.set(currentSet.setName);
    this.currentReps.set(currentSet.reps);
    this.currentWeight.set(currentSet.weight);
  }

  startEditingName(): void {
    this.isEditingName.set(true);
  }

  startEditingReps(): void {
    this.isEditingReps.set(true);
  }

  startEditingWeight(): void {
    this.isEditingWeight.set(true);
  }

  stopEditingName(): void {
    this.isEditingName.set(false);
  }

  stopEditingReps(): void {
    this.isEditingReps.set(false);
  }

  stopEditingWeight(): void {
    this.isEditingWeight.set(false);
  }

  onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentName.set(value);
  }

  onRepsInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.currentReps.set(Number.isNaN(value) ? 0 : value);
  }

  onWeightInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.currentWeight.set(Number.isNaN(value) ? 0 : value);
  }

  hasChanges(): boolean {
    const original = this.set();

    return (
      this.currentName().trim() !== original.setName ||
      this.currentReps() !== original.reps ||
      this.currentWeight() !== original.weight
    );
  }

  cancelEdit(): void {
    this.syncFromSet();
    this.isEditingName.set(false);
    this.isEditingReps.set(false);
    this.isEditingWeight.set(false);
  }

  saveChanges(): void {
    const name = this.currentName().trim();
    if (!name) {
      return;
    }

    const payload: ExerciseSetUpdateDTO = {
      newName: name,
      reps: this.currentReps(),
      weight: this.currentWeight(),
    };

    this.isSaving.set(true);

    this.setService
      .updateExerciseSet(this.set().exerciseSetId, payload)
      .subscribe({
        next: (updatedSet) => {
          this.currentName.set(updatedSet.setName);
          this.currentReps.set(updatedSet.reps);
          this.currentWeight.set(updatedSet.weight);
          this.updated.emit(updatedSet);
          this.cancelEdit();
          this.isSaving.set(false);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  deleteSet(): void {
    const data: ConfirmDialogData = {
      title: 'Excluir série',
      message: 'Tem certeza que deseja excluir esta série?',
    };

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data,
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.setService.delete(this.set().exerciseSetId).subscribe({
        next: () => {
          this.deleted.emit(this.set().exerciseSetId);
        },
      });
    });
  }
}
