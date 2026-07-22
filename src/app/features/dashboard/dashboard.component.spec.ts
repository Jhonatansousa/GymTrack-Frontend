import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
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
  let createSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: MockInstance<Router['navigate']>;
  let fixture: ComponentFixture<DashboardComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    logoutSpy = vi.fn(() => of({ results: {} }));
    checkSessionSpy = vi.fn(() =>
      of({ results: { id: 'u1', email: 'jhonatan@example.com', name: 'Jhonatan' } }),
    );
    getAllSpy = vi.fn(() => of<Division[]>([]));
    createSpy = vi.fn(() => of<Division>({ id: 9, name: 'Pernas' }));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: logoutSpy, checkSession: checkSessionSpy } },
        { provide: DivisionsService, useValue: { getAll: getAllSpy, create: createSpy } },
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

  describe('divisions section', () => {
    const divisions: Division[] = [
      { id: 1, name: 'Peito / Tríceps' },
      { id: 2, name: 'Costas / Bíceps' },
    ];

    describe('when the user has divisions', () => {
      beforeEach(() => {
        getAllSpy.mockReturnValue(of(divisions));
        recreate();
      });

      it('should render the section heading', () => {
        expect(queryByTestId('divisions-heading')?.textContent).toContain('Divisões de Treino');
      });

      it('should render one card per division with its name', () => {
        const cards = queryAllByTestId('division-card');

        expect(cards).toHaveLength(2);
        expect(cards[0].textContent).toContain('Peito / Tríceps');
        expect(cards[1].textContent).toContain('Costas / Bíceps');
      });

      it('should not render the empty state', () => {
        expect(queryByTestId('divisions-empty')).toBeFalsy();
      });
    });

    describe('when the user has no divisions', () => {
      beforeEach(() => {
        getAllSpy.mockReturnValue(of<Division[]>([]));
        recreate();
      });

      it('should render the empty state', () => {
        expect(queryByTestId('divisions-empty')?.textContent).toContain(
          'Nenhuma divisão cadastrada ainda',
        );
      });

      it('should not render any division card', () => {
        expect(queryAllByTestId('division-card')).toHaveLength(0);
      });
    });
  });

  describe('create division', () => {
    const created: Division = { id: 9, name: 'Pernas' };

    function openForm(triggerTestId: string): void {
      (queryByTestId(triggerTestId) as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    function fillAndSubmitForm(name: string): void {
      const input = queryByTestId('division-form-name') as HTMLInputElement;
      input.value = name;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      (queryByTestId('division-form-submit') as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    it('should open the create form from the "Nova Divisão" button', () => {
      getAllSpy.mockReturnValue(of([created]));
      recreate();

      expect(queryByTestId('division-form')).toBeFalsy();
      openForm('new-division-button');

      expect(queryByTestId('division-form')).toBeTruthy();
    });

    it('should open the create form from the empty-state button', () => {
      getAllSpy.mockReturnValue(of<Division[]>([]));
      recreate();

      openForm('create-first-division-button');

      expect(queryByTestId('division-form')).toBeTruthy();
    });

    it('should create the division, reload the list and close the form on save', () => {
      getAllSpy.mockReturnValueOnce(of<Division[]>([]));
      getAllSpy.mockReturnValueOnce(of([created]));
      recreate();

      openForm('create-first-division-button');
      fillAndSubmitForm('Pernas');

      expect(createSpy).toHaveBeenCalledWith('Pernas');
      expect(getAllSpy).toHaveBeenCalledTimes(2);
      expect(queryByTestId('division-form')).toBeFalsy();
      expect(queryAllByTestId('division-card')).toHaveLength(1);
    });

    it('should keep the form open and show a conflict message on 409', () => {
      getAllSpy.mockReturnValue(of<Division[]>([]));
      createSpy.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })));
      recreate();

      openForm('create-first-division-button');
      fillAndSubmitForm('Pernas');

      expect(queryByTestId('division-form')).toBeTruthy();
      expect(queryByTestId('division-form-error')?.textContent).toContain(
        'Já existe uma divisão com esse nome.',
      );
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
