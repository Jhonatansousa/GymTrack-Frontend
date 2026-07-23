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
  let updateSpy: ReturnType<typeof vi.fn>;
  let removeSpy: ReturnType<typeof vi.fn>;
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
    updateSpy = vi.fn(() => of<Division>({ id: 1, name: 'Peito e Tríceps' }));
    removeSpy = vi.fn(() => of<void>(undefined));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: logoutSpy, checkSession: checkSessionSpy } },
        {
          provide: DivisionsService,
          useValue: { getAll: getAllSpy, create: createSpy, update: updateSpy, remove: removeSpy },
        },
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

  function clickByTestId(testId: string): void {
    (queryByTestId(testId) as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  function fillAndSubmitForm(name: string): void {
    const input = queryByTestId('division-form-name') as HTMLInputElement;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    clickByTestId('division-form-submit');
  }

  function menuButton(): HTMLButtonElement {
    return queryByTestId('user-menu-button') as HTMLButtonElement;
  }

  function openMenu(): void {
    menuButton().click();
    fixture.detectChanges();
  }

  it('should pass the authenticated user name to the header greeting', () => {
    expect(queryByTestId('dashboard-greeting')?.textContent).toContain('Olá, Jhonatan');
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

    it('should open the create form from the "Nova Divisão" button', () => {
      getAllSpy.mockReturnValue(of([created]));
      recreate();

      expect(queryByTestId('division-form')).toBeFalsy();
      clickByTestId('new-division-button');

      expect(queryByTestId('division-form')).toBeTruthy();
    });

    it('should open the create form from the empty-state button', () => {
      getAllSpy.mockReturnValue(of<Division[]>([]));
      recreate();

      clickByTestId('create-first-division-button');

      expect(queryByTestId('division-form')).toBeTruthy();
    });

    it('should create the division, reload the list and close the form on save', () => {
      recreate();
      clickByTestId('create-first-division-button');

      getAllSpy.mockClear();
      getAllSpy.mockReturnValueOnce(of([created]));

      fillAndSubmitForm('Pernas');

      expect(createSpy).toHaveBeenCalledWith('Pernas');
      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('division-form')).toBeFalsy();
      expect(queryAllByTestId('division-card')).toHaveLength(1);
    });

    it('should keep the form open and show a conflict message on 409', () => {
      getAllSpy.mockReturnValue(of<Division[]>([]));
      createSpy.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })));
      recreate();

      clickByTestId('create-first-division-button');
      fillAndSubmitForm('Pernas');

      expect(queryByTestId('division-form')).toBeTruthy();
      expect(queryByTestId('division-form-error')?.textContent).toContain(
        'Já existe uma divisão com esse nome.',
      );
    });
  });

  describe('edit division', () => {
    const division: Division = { id: 1, name: 'Peito / Tríceps' };

    beforeEach(() => {
      getAllSpy.mockReturnValue(of([division]));
      recreate();
    });

    it('should open the form in edit mode prefilled when the card edit is clicked', () => {
      clickByTestId('division-card-edit');

      expect(queryByTestId('division-form')).toBeTruthy();
      expect(queryByTestId('division-form-title')?.textContent).toContain('Editar Divisão');
      expect((queryByTestId('division-form-name') as HTMLInputElement).value).toBe(
        'Peito / Tríceps',
      );
    });

    it('should update the division, reload and close the form on save', () => {
      clickByTestId('division-card-edit');

      getAllSpy.mockClear();
      getAllSpy.mockReturnValueOnce(of([{ id: 1, name: 'Peito e Tríceps' }]));

      fillAndSubmitForm('Peito e Tríceps');

      expect(updateSpy).toHaveBeenCalledWith(1, 'Peito e Tríceps');
      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('division-form')).toBeFalsy();
    });

    it('should keep the form open and show a not-found message on 404', () => {
      updateSpy.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 404 })));

      clickByTestId('division-card-edit');
      fillAndSubmitForm('Qualquer nome');

      expect(queryByTestId('division-form')).toBeTruthy();
      expect(queryByTestId('division-form-error')?.textContent).toContain(
        'Divisão não encontrada.',
      );
    });

    it('should show a conflict message on 409', () => {
      updateSpy.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })));

      clickByTestId('division-card-edit');
      fillAndSubmitForm('Costas');

      expect(queryByTestId('division-form-error')?.textContent).toContain(
        'Já existe uma divisão com esse nome.',
      );
    });
  });

  describe('delete division', () => {
    const division: Division = { id: 3, name: 'Pernas' };

    beforeEach(() => {
      getAllSpy.mockReturnValue(of([division]));
      recreate();
    });

    it('should open a confirmation dialog warning about the cascade when delete is clicked', () => {
      clickByTestId('division-card-delete');

      expect(queryByTestId('confirm-dialog')).toBeTruthy();
      expect(queryByTestId('confirm-dialog-message')?.textContent).toContain('exercícios');
    });

    it('should remove the division, reload and close the dialog on confirm', () => {
      clickByTestId('division-card-delete');

      getAllSpy.mockClear();
      getAllSpy.mockReturnValueOnce(of<Division[]>([]));

      clickByTestId('confirm-dialog-confirm');

      expect(removeSpy).toHaveBeenCalledWith(3);
      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
      expect(queryAllByTestId('division-card')).toHaveLength(0);
    });

    it('should close the dialog without deleting on cancel', () => {
      clickByTestId('division-card-delete');
      clickByTestId('confirm-dialog-cancel');

      expect(removeSpy).not.toHaveBeenCalled();
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
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
