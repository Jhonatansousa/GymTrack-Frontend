import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { DivisionsService } from '../../core/services/divisions.service';
import { Division } from '../../core/models/division.model';
import { DivisionCardComponent } from './components/division-card/division-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [DivisionCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header class="flex items-start justify-between gap-5">
        <div>
          <p
            data-testid="dashboard-eyebrow"
            class="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
          >
            Bem-vindo de volta
          </p>
          <h1
            data-testid="dashboard-greeting"
            class="font-serif text-3xl font-semibold tracking-tight text-text"
          >
            Olá, {{ userName() }}
          </h1>
        </div>

        <div class="relative">
          <button
            type="button"
            data-testid="user-menu-button"
            aria-haspopup="menu"
            [attr.aria-expanded]="isMenuOpen()"
            (click)="toggleMenu()"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm font-bold text-text-muted transition-colors duration-150 hover:bg-surface-raised"
          >
            {{ userInitial() }}
          </button>

          @if (isMenuOpen()) {
            <div
              data-testid="user-menu-dropdown"
              role="menu"
              class="absolute right-0 top-full z-10 mt-2 min-w-40 rounded border border-border bg-surface py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                data-testid="user-menu-logout"
                (click)="onLogout()"
                class="w-full px-4 py-2.5 text-left text-sm text-text transition-colors duration-150 hover:bg-surface-raised"
              >
                Sair
              </button>
            </div>
          }
        </div>
      </header>

      @if (divisions().length > 0) {
        <section aria-labelledby="divisions-heading">
          <p
            id="divisions-heading"
            data-testid="divisions-heading"
            class="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
          >
            Divisões de Treino
          </p>

          <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            @for (division of divisions(); track division.id) {
              <app-division-card [division]="division" />
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
        </section>
      }
    </section>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly divisionsService = inject(DivisionsService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isMenuOpen = signal(false);
  readonly userName = signal('');
  readonly userInitial = computed(() => this.userName().charAt(0).toUpperCase());
  readonly divisions = signal<Division[]>([]);

  constructor() {
    this.authService.checkSession().subscribe({
      next: (response) => this.userName.set(response.results.name),
    });
    this.divisionsService.getAll().subscribe({
      next: (divisions) => this.divisions.set(divisions),
    });
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
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
