import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Division } from '../../../../core/models/division.model';

@Component({
  selector: 'app-division-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      data-testid="division-card"
      class="relative rounded-md border border-border bg-surface p-5 transition-colors duration-150 hover:border-border-strong"
    >
      <div class="absolute right-3 top-3 flex gap-1">
        <button
          type="button"
          data-testid="division-card-edit"
          aria-label="Editar divisão"
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
      </div>

      <h3 class="pr-16 font-sans text-lg font-semibold text-text">{{ division().name }}</h3>

      <div class="mt-5 flex items-center justify-between border-t border-border pt-3.5">
        <span class="text-sm font-medium text-accent">Ver exercícios</span>
        <svg
          class="text-accent"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3L10.5 7.5L6 12"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </article>
  `,
})
export class DivisionCardComponent {
  readonly division = input.required<Division>();

  readonly edit = output<void>();
}
