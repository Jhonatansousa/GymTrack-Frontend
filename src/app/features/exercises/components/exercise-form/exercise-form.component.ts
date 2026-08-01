import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { shouldShowError } from '../../../../shared/utils/form-errors';

@Component({
  selector: 'app-exercise-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
      <div
        data-testid="exercise-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-form-title"
        class="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h2
          id="exercise-form-title"
          data-testid="exercise-form-title"
          class="mb-5 font-serif text-xl font-semibold text-text"
        >
          {{ heading() }}
        </h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <label for="exercise-form-name" class="mb-2 block text-sm font-medium text-text-muted">
            Nome do exercício
          </label>
          <input
            #nameInput
            id="exercise-form-name"
            data-testid="exercise-form-name"
            type="text"
            formControlName="name"
            class="w-full rounded border border-border bg-canvas px-3 py-2.5 text-text outline-none focus-visible:border-accent"
          />

          @if (shouldShowError(form.controls.name, 'required')) {
            <p data-testid="exercise-form-name-error" class="mt-2 text-sm text-error">
              O nome é obrigatório.
            </p>
          } @else if (shouldShowError(form.controls.name, 'maxlength')) {
            <p data-testid="exercise-form-name-error" class="mt-2 text-sm text-error">
              O nome deve ter no máximo 50 caracteres.
            </p>
          }

          @if (errorMessage()) {
            <p data-testid="exercise-form-error" class="mt-3 text-sm text-error">
              {{ errorMessage() }}
            </p>
          }

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              data-testid="exercise-form-cancel"
              (click)="cancelled.emit()"
              class="rounded px-4 py-2.5 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface-raised"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="exercise-form-submit"
              [disabled]="isSubmitting()"
              class="rounded bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ submitLabel() }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ExerciseFormComponent {
  readonly heading = input('Novo Exercício');
  readonly submitLabel = input('Criar');
  readonly initialName = input('');
  readonly errorMessage = input('');
  readonly isSubmitting = input(false);

  readonly save = output<string>();
  readonly cancelled = output<void>();

  readonly shouldShowError = shouldShowError;

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
  });

  constructor() {
    effect(() => this.form.controls.name.setValue(this.initialName()));
    effect(() => this.nameInput()?.nativeElement.focus());
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.controls.name.value.trim());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelled.emit();
  }
}
