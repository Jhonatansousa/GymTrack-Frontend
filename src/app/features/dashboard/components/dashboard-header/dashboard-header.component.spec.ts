import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DashboardHeaderComponent } from './dashboard-header.component';

describe('DashboardHeaderComponent', () => {
  let fixture: ComponentFixture<DashboardHeaderComponent>;
  let component: DashboardHeaderComponent;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DashboardHeaderComponent] });

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userName', 'Jhonatan');
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

  describe('greeting', () => {
    it('should render the welcome eyebrow', () => {
      expect(queryByTestId('dashboard-eyebrow')?.textContent).toContain('Bem-vindo de volta');
    });

    it('should greet the user by name', () => {
      expect(queryByTestId('dashboard-greeting')?.textContent).toContain('Olá, Jhonatan');
    });

    it('should render the user initial in the avatar button', () => {
      expect(menuButton().textContent?.trim()).toBe('J');
    });

    it('should render "Bem-vindo" without "de volta" on first access', () => {
      fixture.componentRef.setInput('isFirstAccess', true);
      fixture.detectChanges();

      const eyebrow = queryByTestId('dashboard-eyebrow')?.textContent?.trim();
      expect(eyebrow).toBe('Bem-vindo');
    });
  });

  describe('user menu', () => {
    it('should be collapsed by default', () => {
      expect(menuButton().getAttribute('aria-haspopup')).toBe('menu');
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(queryByTestId('user-menu-dropdown')).toBeFalsy();
    });

    it('should open the dropdown on click', () => {
      openMenu();

      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
      expect(queryByTestId('user-menu-dropdown')).toBeTruthy();
    });

    it('should close the dropdown when clicking outside', () => {
      openMenu();

      document.body.click();
      fixture.detectChanges();

      expect(queryByTestId('user-menu-dropdown')).toBeFalsy();
    });

    it('should emit logout when the logout item is clicked', () => {
      const logoutSpy = vi.fn();
      component.logout.subscribe(logoutSpy);
      openMenu();

      (queryByTestId('user-menu-logout') as HTMLButtonElement).click();

      expect(logoutSpy).toHaveBeenCalled();
    });
  });
});
