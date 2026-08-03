import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { WorkoutSet } from '../../../../core/models/workout-set.model';

@Component({
  selector: 'app-set-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="set-card" class="rounded-md border border-border bg-surface p-3.5">
      <div class="flex items-center gap-3">
        <span data-testid="set-card-index" class="w-5 shrink-0 font-mono text-xs text-text-faint">
          {{ indexLabel() }}
        </span>
        <p class="truncate font-sans text-[14.5px] font-semibold text-text">{{ set().name }}</p>
      </div>
    </div>
  `,
})
export class SetCardComponent {
  readonly set = input.required<WorkoutSet>();
  readonly index = input.required<number>();

  readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));
}
