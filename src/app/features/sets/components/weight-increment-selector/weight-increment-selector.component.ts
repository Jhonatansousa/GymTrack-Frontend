import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

const WEIGHT_INCREMENT_OPTIONS = [0.5, 1, 2.5, 5] as const;

@Component({
  selector: 'app-weight-increment-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-1.5">
      @for (option of options; track option) {
        <button
          type="button"
          data-testid="weight-increment-option"
          [attr.aria-pressed]="option === active()"
          (click)="select.emit(option)"
          class="rounded border px-3 py-1.5 font-mono text-xs font-semibold transition-colors duration-150"
          [class.bg-accent]="option === active()"
          [class.text-on-accent]="option === active()"
          [class.border-accent]="option === active()"
          [class.bg-surface-raised]="option !== active()"
          [class.text-text-muted]="option !== active()"
          [class.border-border]="option !== active()"
        >
          {{ option }}
        </button>
      }
    </div>
  `,
})
export class WeightIncrementSelectorComponent {
  readonly active = input.required<number>();
  readonly select = output<number>();

  readonly options = WEIGHT_INCREMENT_OPTIONS;
}
