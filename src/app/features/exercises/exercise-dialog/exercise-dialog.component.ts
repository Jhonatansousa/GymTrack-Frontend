import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ExerciseDialogData {
  exerciseId?: number;
  exerciseName?: string;
}

@Component({
  selector: 'app-exercise-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './exercise-dialog.component.html',
})
export class ExerciseDialogComponent {
  private fb = inject(FormBuilder);
  readonly data = inject<ExerciseDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });
  private dialogRef = inject(MatDialogRef<ExerciseDialogComponent>);

  form = this.fb.group({
    name: [this.data?.exerciseName ?? '', [Validators.required]],
  });

  get isEditMode(): boolean {
    return !!this.data?.exerciseId;
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      exerciseId: this.data?.exerciseId,
      name: this.form.getRawValue().name,
    });
  }
}
