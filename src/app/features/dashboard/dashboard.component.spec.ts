import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navigation, Router, provideRouter } from '@angular/router';
import { MockInstance, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DivisionsService } from '../../core/services/divisions.service';
import { Division } from '../../core/models/division.model';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let logoutSpy: ReturnType<typeof vi.fn>;
  let checkSessionSpy: ReturnType<typeof vi.fn>;
  let getAllSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: MockInstance<Router['navigate']>;
  let fixture: ComponentFixture<DashboardComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    logoutSpy = vi.fn(() => of({ results: {} }));
    checkSessionSpy = vi.fn(() =>
      of({ results: { id: 'u1', email: 'jhonatan@example.com', name: 'Jhonatan' } }),
    );
    getAllSpy = vi.fn(() => of<Division[]>([]));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: logoutSpy, checkSession: checkSessionSpy } },
        { provide: DivisionsService, useValue: { getAll: getAllSpy } },
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

  function queryAllByTestId(testId: string): HTMLElement[] {
    return Array.from(compiled.querySelectorAll(`[data-testid='${testId}']`));
  }

  function recreate(): void {
    fixture = TestBed.createComponent(DashboardComponent);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function menuButton(): HTMLButtonElement {
    return queryByTestId('user-menu-button') as HTMLButtonElement;
  }

  function openMenu(): void {
    menuButton().click();
    fixture.detectChanges();
  }

  function mockNavigationState(state: Record<string, unknown> | undefined): void {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue(
      state ? ({ extras: { state } } as unknown as Navigation) : null,
    );
  }

  it('should pass the authenticated user name to the header greeting', () => {
    expect(queryByTestId('dashboard-greeting')?.textContent).toContain('Olá, Jhonatan');
  });

  describe('first access', () => {
    it('should mark the header as first access when navigated with justRegistered state', () => {
      mockNavigationState({ justRegistered: true });

      recreate();

      expect(queryByTestId('dashboard-eyebrow')?.textContent?.trim()).toBe('Bem-vindo');
    });

    it('should default to the returning-user greeting without navigation state', () => {
      mockNavigationState(undefined);

      recreate();

      expect(queryByTestId('dashboard-eyebrow')?.textContent?.trim()).toBe('Bem-vindo de volta');
    });
  });

  describe('when checkSession fails', () => {
    beforeEach(() => {
      checkSessionSpy.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      getAllSpy.mockReturnValue(of<Division[]>([{ id: 1, name: 'Pernas' }]));
    });

    it('should not leave the error unhandled', () => {
      vi.useFakeTimers();

      expect(() => {
        recreate();
        vi.runAllTimers();
      }).not.toThrow();

      vi.useRealTimers();
    });

    it('should still render the greeting header and load the divisions', () => {
      recreate();

      expect(queryByTestId('dashboard-greeting')).toBeTruthy();
      expect(queryAllByTestId('division-card')).toHaveLength(1);
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
