import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { DivisionsService } from '../../core/services/divisions.service';
import { Division } from '../../core/models/division.model';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DivisionCardComponent } from './components/division-card/division-card.component';
import { DivisionFormComponent } from './components/division-form/division-form.component';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeaderComponent, DivisionCardComponent, DivisionFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <app-dashboard-header [userName]="userName()" (logout)="onLogout()" />

      @if (divisions().length > 0) {
        <section aria-labelledby="divisions-heading">
          <div class="mb-5 flex items-center justify-between gap-4">
            <p
              id="divisions-heading"
              data-testid="divisions-heading"
              class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            >
              Divisões de Treino
            </p>
            <button
              type="button"
              data-testid="new-division-button"
              (click)="openForm()"
              class="inline-flex items-center gap-2 rounded bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              Nova Divisão
            </button>
          </div>

          <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            @for (division of divisions(); track division.id) {
              <app-division-card [division]="division" (edit)="openEditForm(division)" />
            }
          </div>
        </section>
      } @else {
        <section
          data-testid="divisions-empty"
          class="flex flex-col items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-center"
        >
          <div
            aria-hidden="true"
            class="mb-7 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-surface-raised text-text-faint"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M5 13H9M17 13H21M9 8V18M17 8V18M9 13H17"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h2 class="mb-2.5 font-serif text-2xl font-semibold text-text">
            Nenhuma divisão cadastrada ainda
          </h2>
          <p class="max-w-sm text-sm leading-relaxed text-text-muted">
            Crie sua primeira divisão de treino para começar a organizar seus exercícios e
            acompanhar sua evolução.
          </p>
          <button
            type="button"
            data-testid="create-first-division-button"
            (click)="openForm()"
            class="mt-7 inline-flex items-center gap-2 rounded bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-dim"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            Criar primeira divisão
          </button>
        </section>
      }

      @if (isFormOpen()) {
        <app-division-form
          [heading]="editingDivision() ? 'Editar Divisão' : 'Nova Divisão'"
          [submitLabel]="editingDivision() ? 'Salvar' : 'Criar'"
          [initialName]="editingDivision()?.name ?? ''"
          [errorMessage]="formError()"
          (save)="onSubmitForm($event)"
          (cancel)="closeForm()"
        />
      }
    </section>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly divisionsService = inject(DivisionsService);
  private readonly router = inject(Router);

  readonly userName = signal('');
  readonly divisions = signal<Division[]>([]);
  readonly isFormOpen = signal(false);
  readonly formError = signal('');
  readonly editingDivision = signal<Division | null>(null);

  constructor() {
    this.authService.checkSession().subscribe({
      next: (response) => this.userName.set(response.results.name),
    });
    this.loadDivisions();
  }

  openForm(): void {
    this.editingDivision.set(null);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  openEditForm(division: Division): void {
    this.editingDivision.set(division);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingDivision.set(null);
  }

  onSubmitForm(name: string): void {
    const editing = this.editingDivision();
    const request = editing
      ? this.divisionsService.update(editing.id, name)
      : this.divisionsService.create(name);

    this.formError.set('');
    request.subscribe({
      next: () => {
        this.closeForm();
        this.loadDivisions();
      },
      error: (error: HttpErrorResponse) => this.formError.set(this.mapFormError(error)),
    });
  }

  private mapFormError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 409:
        return 'Já existe uma divisão com esse nome.';
      case 404:
        return 'Divisão não encontrada.';
      default:
        return 'Não foi possível salvar a divisão. Tente novamente.';
    }
  }

  private loadDivisions(): void {
    this.divisionsService.getAll().subscribe({
      next: (divisions) => this.divisions.set(divisions),
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.navigateToAuth(),
      error: () => this.navigateToAuth(),
    });
  }

  private navigateToAuth(): void {
    void this.router.navigate(['/auth'], { replaceUrl: true });
  }
}
