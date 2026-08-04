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

import { WorkoutSet } from '../../../../core/models/workout-set.model';
import { StepperFieldComponent } from '../stepper-field/stepper-field.component';

@Component({
  selector: 'app-set-card',
  imports: [StepperFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="set-card" class="rounded-md border border-border bg-surface p-3.5">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span data-testid="set-card-index" class="w-5 shrink-0 font-mono text-xs text-text-faint">
            {{ indexLabel() }}
          </span>

          @if (isRenaming()) {
            <input
              #nameInput
              data-testid="set-card-name-input"
              type="text"
              [value]="draftName()"
              (input)="onDraftNameInput($event)"
              (keydown.enter)="commitRename()"
              (keydown.escape)="cancelRename()"
              (blur)="commitRename()"
              class="min-w-0 flex-1 rounded border border-border bg-canvas px-2.5 py-1.5 text-[14.5px] font-semibold text-text outline-none focus-visible:border-accent"
            />
          } @else {
            <p class="truncate font-sans text-[14.5px] font-semibold text-text">{{ set().name }}</p>
          }
        </div>

        <div class="flex shrink-0 gap-1">
          <button
            type="button"
            data-testid="set-card-edit"
            aria-label="Renomear série"
            (click)="startRename()"
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
            data-testid="set-card-delete"
            aria-label="Excluir série"
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

      <div class="mt-3.5 grid grid-cols-2 gap-2.5">
        <app-stepper-field
          label="Carga (kg)"
          [value]="set().weight"
          [step]="weightIncrement()"
          [allowDecimals]="true"
          (valueChange)="weightChange.emit($event)"
        />
        <app-stepper-field
          label="Repetições"
          [value]="set().reps"
          [step]="1"
          (valueChange)="repsChange.emit($event)"
        />
      </div>
    </div>
  `,
})
export class SetCardComponent {
  readonly set = input.required<WorkoutSet>();
  readonly index = input.required<number>();
  readonly weightIncrement = input.required<number>();

  readonly remove = output<void>();
  readonly rename = output<string>();
  readonly weightChange = output<number>();
  readonly repsChange = output<number>();

  readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));

  readonly isRenaming = signal(false);
  readonly draftName = signal('');

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    effect(() => this.nameInput()?.nativeElement.focus());
  }

  startRename(): void {
    this.draftName.set(this.set().name);
    this.isRenaming.set(true);
  }

  cancelRename(): void {
    this.isRenaming.set(false);
  }

  commitRename(): void {
    if (!this.isRenaming()) return;

    const trimmed = this.draftName().trim();
    if (!trimmed) return;

    this.isRenaming.set(false);
    this.rename.emit(trimmed);
  }

  onDraftNameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }
}
