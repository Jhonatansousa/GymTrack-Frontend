import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SetService } from '../../../core/services/set.service';
import { ExerciseSetResponseDTO } from '../../../core/models/set.model';

@Component({
  selector: 'app-exercise-sets-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './exercise-sets-list.component.html',
  styleUrl: './exercise-sets-list.component.scss',
})
export class ExerciseSetsListComponent implements OnInit {
  private setService = inject(SetService);
  private fb = inject(FormBuilder);

  exerciseId = input.required<number>();

  sets = signal<ExerciseSetResponseDTO[]>([]);
  isLoading = signal(false);
  hasError = signal(false);

  form = this.fb.group({
    reps: [null as number | null, [Validators.required, Validators.min(1)]],
    weight: [null as number | null, [Validators.required, Validators.min(0)]],
  });

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

  addSet(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.setService
      .create({
        exerciseId: this.exerciseId(),
        reps: Number(raw.reps),
        weight: Number(raw.weight),
      })
      .subscribe({
        next: (createdSet) => {
          this.sets.update((current) => [...current, createdSet]);
          this.form.reset();
          this.form.markAsPristine();
          this.form.markAsUntouched();
        },
        error: () => {
          this.hasError.set(true);
        },
      });
  }

  deleteSet(setId: number): void {
    this.setService.delete(setId).subscribe({
      next: () => {
        this.sets.update((current) =>
          current.filter((exerciseSet) => exerciseSet.exerciseSetId !== setId)
        );
      },
      error: () => {
        this.hasError.set(true);
      },
    });
  }
}
