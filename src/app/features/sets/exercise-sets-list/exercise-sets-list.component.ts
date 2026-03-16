import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SetService } from '../../../core/services/set.service';
import { ExerciseSetResponseDTO } from '../../../core/models/set.model';
import { SetRowComponent } from '../set-row/set-row.component';

@Component({
  selector: 'app-exercise-sets-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    SetRowComponent,
  ],
  templateUrl: './exercise-sets-list.component.html',
  styleUrl: './exercise-sets-list.component.scss',
})
export class ExerciseSetsListComponent implements OnInit {
  private setService = inject(SetService);

  exerciseId = input.required<number>();

  sets = signal<ExerciseSetResponseDTO[]>([]);
  isLoading = signal(false);
  hasError = signal(false);

  ngOnInit(): void {
    this.loadSets();
  }

  loadSets(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.setService.getByExercise(this.exerciseId()).subscribe({
      next: (sets) => {
        this.sets.set(sets);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  addNewSet(): void {
    this.setService
      .createNewSet({
        exerciseId: this.exerciseId(),
        reps: null,
        weight: null,
      })
      .subscribe({
        next: (createdSet) => {
          this.sets.update((current) => [...current, createdSet]);
        },
        error: () => {
          this.hasError.set(true);
        },
      });
  }

  onSetDeleted(setId: number): void {
    this.sets.update((current) =>
      current.filter((exerciseSet) => exerciseSet.exerciseSetId !== setId)
    );
  }

  onSetUpdated(updatedSet: ExerciseSetResponseDTO): void {
    this.sets.update((current) =>
      current.map((item) =>
        item.exerciseSetId === updatedSet.exerciseSetId ? updatedSet : item
      )
    );
  }
}
