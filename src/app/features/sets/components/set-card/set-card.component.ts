import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { WorkoutSet } from '../../../../core/models/workout-set.model';

@Component({
  selector: 'app-set-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="set-card" class="rounded-md border border-border bg-surface p-3.5">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span data-testid="set-card-index" class="w-5 shrink-0 font-mono text-xs text-text-faint">
            {{ indexLabel() }}
          </span>
          <p class="truncate font-sans text-[14.5px] font-semibold text-text">{{ set().name }}</p>
        </div>

        <button
          type="button"
          data-testid="set-card-delete"
          aria-label="Excluir série"
          (click)="remove.emit()"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-faint transition-colors duration-150 hover:bg-error/15 hover:text-error"
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
export class SetCardComponent {
  readonly set = input.required<WorkoutSet>();
  readonly index = input.required<number>();

  readonly remove = output<void>();

  readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));
}
