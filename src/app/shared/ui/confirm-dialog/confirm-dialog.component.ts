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

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <div
        data-testid="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        class="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h2
          id="confirm-dialog-title"
          data-testid="confirm-dialog-title"
          class="mb-2.5 font-serif text-xl font-semibold text-text"
        >
          {{ title() }}
        </h2>
        <p
          id="confirm-dialog-message"
          data-testid="confirm-dialog-message"
          class="text-sm leading-relaxed text-text-muted"
        >
          {{ message() }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            #cancelButton
            type="button"
            data-testid="confirm-dialog-cancel"
            (click)="cancel.emit()"
            class="rounded px-4 py-2.5 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface-raised"
          >
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            data-testid="confirm-dialog-confirm"
            [disabled]="isConfirming()"
            (click)="confirm.emit()"
            class="rounded bg-error px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input('');
  readonly message = input('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly isConfirming = input(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    // Focus the cancel button, not confirm: this dialog's primary action is
    // destructive, so an accidental Enter keypress should not delete anything.
    effect(() => this.cancelButton()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel.emit();
  }
}
