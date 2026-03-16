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

export interface DivisionDialogData {
  id?: number;
  name?: string;
}

@Component({
  selector: 'app-division-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './division-dialog.component.html',
  styleUrls: ['./division-dialog.component.scss'],
})
export class DivisionDialogComponent {
  private fb = inject(FormBuilder);
  readonly data = inject<DivisionDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });
  private dialogRef = inject(MatDialogRef<DivisionDialogComponent>);

  form = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required]],
  });

  get isEditMode(): boolean {
    return !!this.data?.id;
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
      id: this.data?.id,
      name: this.form.getRawValue().name,
    });
  }
}
