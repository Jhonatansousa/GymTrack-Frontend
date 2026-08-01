import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Exercise } from '../../../../core/models/exercise.model';

@Component({
  selector: 'app-exercise-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-testid="exercise-row"
      class="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4.5 py-4"
    >
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <span data-testid="exercise-row-index" class="w-6 shrink-0 font-mono text-xs text-text-faint">
          {{ indexLabel() }}
        </span>
        <p class="truncate font-sans text-[15px] font-semibold text-text">{{ exercise().name }}</p>
      </div>

      <div class="flex shrink-0 gap-1">
        <button
          type="button"
          data-testid="exercise-row-edit"
          aria-label="Renomear exercício"
          (click)="edit.emit()"
          class="flex h-8 w-8 items-center justify-center rounded text-text-faint transition-colors duration-150 hover:bg-surface-raised hover:text-text"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
              d="M10.5 1.5L13.5 4.5L5 13H2V10L10.5 1.5Z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          data-testid="exercise-row-delete"
          aria-label="Excluir exercício"
          (click)="remove.emit()"
          class="flex h-8 w-8 items-center justify-center rounded text-text-faint transition-colors duration-150 hover:bg-error/15 hover:text-error"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
              d="M3 4H12M5.5 4V2.5H9.5V4M6 6.5V10.5M9 6.5V10.5M4 4L4.7 12H10.3L11 4"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ExerciseRowComponent {
  readonly exercise = input.required<Exercise>();
  readonly index = input.required<number>();

  readonly edit = output<void>();
  readonly remove = output<void>();

  readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));
}
