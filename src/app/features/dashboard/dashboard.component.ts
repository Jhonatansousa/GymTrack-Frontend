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

@Component({
  selector: 'app-dashboard',
  imports: [],
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
    </section>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isMenuOpen = signal(false);
  readonly userName = signal('');
  readonly userInitial = computed(() => this.userName().charAt(0).toUpperCase());

  constructor() {
    this.authService.checkSession().subscribe({
      next: (response) => this.userName.set(response.results.name),
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
