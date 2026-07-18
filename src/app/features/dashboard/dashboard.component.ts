import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <header class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold">Dashboard</h1>
          <p data-testid="dashboard-welcome" class="text-sm">Bem-vindo!</p>
        </div>

        <div class="relative">
          <button
            type="button"
            data-testid="user-menu-button"
            aria-haspopup="menu"
            [attr.aria-expanded]="isMenuOpen()"
            (click)="toggleMenu()"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors duration-150 hover:bg-surface-raised"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 15c0-2.8 2.7-5 6-5s6 2.2 6 5"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
