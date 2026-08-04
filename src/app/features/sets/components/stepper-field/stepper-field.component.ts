import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatValue(value: number): string {
  const rounded = round1(value);
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

@Component({
  selector: 'app-stepper-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="stepper-field" class="rounded-md border border-border bg-surface-raised p-2.5">
      <p class="mb-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-faint">
        {{ label() }}
      </p>
      <div class="flex items-center justify-between gap-1.5">
        <button
          type="button"
          data-testid="stepper-field-decrement"
          [attr.aria-label]="'Diminuir ' + label()"
          (click)="onDecrement()"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface text-lg font-semibold text-text transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          −
        </button>

        @if (isEditing()) {
          <input
            #valueInput
            data-testid="stepper-field-input"
            type="number"
            [attr.inputmode]="allowDecimals() ? 'decimal' : 'numeric'"
            [value]="draftValue()"
            (input)="onDraftInput($event)"
            (keydown.enter)="commitEdit()"
            (keydown.escape)="cancelEdit()"
            (blur)="commitEdit()"
            class="min-w-0 flex-1 rounded-md border border-border bg-canvas px-1 py-2 text-center font-mono text-[17px] font-bold text-text outline-none focus-visible:border-accent"
          />
        } @else {
          <button
            type="button"
            data-testid="stepper-field-value"
            (click)="startEdit()"
            class="min-w-0 flex-1 rounded-md px-0.5 py-2 text-center font-mono text-[17px] font-bold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {{ displayValue() }}
          </button>
        }

        <button
          type="button"
          data-testid="stepper-field-increment"
          [attr.aria-label]="'Aumentar ' + label()"
          (click)="onIncrement()"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface text-lg font-semibold text-text transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          +
        </button>
      </div>
    </div>
  `,
})
export class StepperFieldComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly step = input(1);
  readonly allowDecimals = input(false);

  readonly valueChange = output<number>();

  readonly displayValue = computed(() => formatValue(this.value()));

  readonly isEditing = signal(false);
  readonly draftValue = signal('');

  private readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');

  constructor() {
    effect(() => this.valueInput()?.nativeElement.focus());
  }

  onIncrement(): void {
    this.valueChange.emit(Math.max(0, round1(this.value() + this.step())));
  }

  onDecrement(): void {
    this.valueChange.emit(Math.max(0, round1(this.value() - this.step())));
  }

  startEdit(): void {
    this.draftValue.set(this.displayValue());
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  commitEdit(): void {
    if (!this.isEditing()) return;

    const parsed = parseFloat(this.draftValue().replace(',', '.'));
    const safeValue = !isNaN(parsed) && parsed >= 0 ? round1(parsed) : 0;

    this.isEditing.set(false);
    this.valueChange.emit(safeValue);
  }

  onDraftInput(event: Event): void {
    this.draftValue.set((event.target as HTMLInputElement).value);
  }
}
