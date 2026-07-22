import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
              (click)="onLogoutClick()"
              class="w-full px-4 py-2.5 text-left text-sm text-text transition-colors duration-150 hover:bg-surface-raised"
            >
              Sair
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class DashboardHeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly userName = input('');
  readonly logout = output<void>();

  readonly isMenuOpen = signal(false);
  readonly userInitial = computed(() => this.userName().charAt(0).toUpperCase());

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  onLogoutClick(): void {
    this.isMenuOpen.set(false);
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }
}
