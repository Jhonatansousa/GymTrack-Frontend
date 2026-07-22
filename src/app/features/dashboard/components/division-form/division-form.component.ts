import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { shouldShowError } from '../../../../shared/utils/form-errors';

@Component({
  selector: 'app-division-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
      <div
        data-testid="division-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="division-form-title"
        class="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h2 id="division-form-title" class="mb-5 font-serif text-xl font-semibold text-text">
          Nova Divisão
        </h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <label for="division-form-name" class="mb-2 block text-sm font-medium text-text-muted">
            Nome da divisão
          </label>
          <input
            id="division-form-name"
            data-testid="division-form-name"
            type="text"
            formControlName="name"
            class="w-full rounded border border-border bg-canvas px-3 py-2.5 text-text outline-none focus-visible:border-accent"
          />

          @if (shouldShowError(form.controls.name, 'required')) {
            <p data-testid="division-form-name-error" class="mt-2 text-sm text-error">
              O nome é obrigatório.
            </p>
          } @else if (shouldShowError(form.controls.name, 'maxlength')) {
            <p data-testid="division-form-name-error" class="mt-2 text-sm text-error">
              O nome deve ter no máximo 50 caracteres.
            </p>
          }

          @if (errorMessage()) {
            <p data-testid="division-form-error" class="mt-3 text-sm text-error">
              {{ errorMessage() }}
            </p>
          }

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              data-testid="division-form-cancel"
              (click)="cancel.emit()"
              class="rounded px-4 py-2.5 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface-raised"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="division-form-submit"
              class="rounded bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DivisionFormComponent {
  readonly errorMessage = input('');

  readonly save = output<string>();
  readonly cancel = output<void>();

  readonly shouldShowError = shouldShowError;

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.controls.name.value.trim());
  }
}
