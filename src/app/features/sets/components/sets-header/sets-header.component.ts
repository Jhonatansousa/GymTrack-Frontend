import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { WeightIncrementSelectorComponent } from '../weight-increment-selector/weight-increment-selector.component';

@Component({
  selector: 'app-sets-header',
  imports: [WeightIncrementSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      data-testid="back-to-exercises-button"
      (click)="back.emit()"
      class="inline-flex items-center gap-2 self-start text-sm font-medium text-text-muted transition-colors duration-150 hover:text-text"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M9 1.5L3 7L9 12.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ divisionName() }}
    </button>

    <div class="flex items-start justify-between gap-4">
      <div>
        <p
          data-testid="sets-eyebrow"
          class="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
        >
          Exercício
        </p>
        <h1
          data-testid="sets-heading"
          class="font-serif text-3xl font-semibold tracking-tight text-text"
        >
          {{ exerciseName() }}
        </h1>
      </div>
      <button
        type="button"
        data-testid="add-set-button"
        [disabled]="isCreating()"
        (click)="addSet.emit()"
        class="inline-flex items-center gap-2 rounded bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        Adicionar Série
      </button>
    </div>

    <div class="flex items-center gap-2.5">
      <span class="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-faint">
        Incremento da carga
      </span>
      <app-weight-increment-selector
        [active]="weightIncrement()"
        (selected)="weightIncrementSelected.emit($event)"
      />
    </div>
  `,
})
export class SetsHeaderComponent {
  readonly divisionName = input.required<string>();
  readonly exerciseName = input.required<string>();
  readonly isCreating = input(false);
  readonly weightIncrement = input.required<number>();

  readonly back = output<void>();
  readonly addSet = output<void>();
  readonly weightIncrementSelected = output<number>();
}
