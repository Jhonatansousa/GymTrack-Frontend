import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MockInstance, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let logoutSpy: ReturnType<typeof vi.fn>;
  let checkSessionSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: MockInstance<Router['navigate']>;
  let fixture: ComponentFixture<DashboardComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    logoutSpy = vi.fn(() => of({ results: {} }));
    checkSessionSpy = vi.fn(() =>
      of({ results: { id: 'u1', email: 'jhonatan@example.com', name: 'Jhonatan' } }),
    );

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: logoutSpy, checkSession: checkSessionSpy } },
      ],
    });

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(DashboardComponent);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function menuButton(): HTMLButtonElement {
    return queryByTestId('user-menu-button') as HTMLButtonElement;
  }

  function openMenu(): void {
    menuButton().click();
    fixture.detectChanges();
  }

  describe('greeting header', () => {
    it('should render the welcome eyebrow', () => {
      expect(queryByTestId('dashboard-eyebrow')?.textContent).toContain('Bem-vindo de volta');
    });

    it('should greet the authenticated user by name', () => {
      expect(queryByTestId('dashboard-greeting')?.textContent).toContain('Olá, Jhonatan');
    });

    it('should render the user initial in the avatar button', () => {
      expect(menuButton().textContent?.trim()).toBe('J');
    });
  });

  describe('user menu button', () => {
    it('should render the user menu button collapsed by default', () => {
      expect(menuButton()).toBeTruthy();
      expect(menuButton().getAttribute('aria-haspopup')).toBe('menu');
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(queryByTestId('user-menu-dropdown')).toBeFalsy();
    });

    it('should open the dropdown when the button is clicked', () => {
      openMenu();

      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
      expect(queryByTestId('user-menu-dropdown')).toBeTruthy();
      expect(queryByTestId('user-menu-logout')).toBeTruthy();
    });

    it('should close the dropdown when clicking outside', () => {
      openMenu();

      document.body.click();
      fixture.detectChanges();

      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(queryByTestId('user-menu-dropdown')).toBeFalsy();
    });
  });

  describe('logout action', () => {
    it('should call AuthService.logout and navigate to /auth on success', () => {
      openMenu();

      (queryByTestId('user-menu-logout') as HTMLButtonElement).click();

      expect(logoutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth'], { replaceUrl: true });
    });

    it('should navigate to /auth even when AuthService.logout fails', () => {
      logoutSpy.mockReturnValueOnce(throwError(() => new Error('network error')));
      openMenu();

      (queryByTestId('user-menu-logout') as HTMLButtonElement).click();

      expect(navigateSpy).toHaveBeenCalledWith(['/auth'], { replaceUrl: true });
    });
  });
});
