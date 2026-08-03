import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Navigation,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { MockInstance, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { Division } from '../../core/models/division.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { Exercise } from '../../core/models/exercise.model';
import { ExercisesService } from '../../core/services/exercises.service';
import { ExercisesComponent } from './exercises.component';

describe('ExercisesComponent', () => {
  let fixture: ComponentFixture<ExercisesComponent>;
  let compiled: HTMLElement;
  let navigateSpy: MockInstance<Router['navigate']>;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let getByDivisionSpy: ReturnType<typeof vi.fn>;
  let createExerciseSpy: ReturnType<typeof vi.fn>;
  let updateExerciseSpy: ReturnType<typeof vi.fn>;
  let removeExerciseSpy: ReturnType<typeof vi.fn>;
  let activatedRouteMock: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function queryAllByTestId(testId: string): HTMLElement[] {
    return Array.from(compiled.querySelectorAll(`[data-testid='${testId}']`));
  }

  function mockNavigationState(state: Record<string, unknown> | undefined): void {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue(
      state ? ({ extras: { state } } as unknown as Navigation) : null,
    );
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(ExercisesComponent);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function clickByTestId(testId: string): void {
    (queryByTestId(testId) as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  function fillAndSubmitForm(name: string): void {
    const input = queryByTestId('exercise-form-name') as HTMLInputElement;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    clickByTestId('exercise-form-submit');
  }

  beforeEach(() => {
    getByIdSpy = vi.fn(() => of<Division>({ id: 5, name: 'Pernas' }));
    getByDivisionSpy = vi.fn(() => of<Exercise[]>([]));
    createExerciseSpy = vi.fn(() => of<Exercise>({ id: 101, name: 'Supino Reto', workoutDivisionId: 5 }));
    updateExerciseSpy = vi.fn(() => of<void>(undefined));
    removeExerciseSpy = vi.fn(() => of<void>(undefined));
    activatedRouteMock = { snapshot: { paramMap: convertToParamMap({ divisionId: '5' }) } };

    TestBed.configureTestingModule({
      imports: [ExercisesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DivisionsService, useValue: { getById: getByIdSpy } },
        {
          provide: ExercisesService,
          useValue: {
            getByDivision: getByDivisionSpy,
            create: createExerciseSpy,
            update: updateExerciseSpy,
            remove: removeExerciseSpy,
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should render the "Divisão de treino" eyebrow', () => {
    mockNavigationState({ divisionName: 'Pernas' });
    createComponent();

    expect(queryByTestId('exercises-eyebrow')?.textContent).toContain('Divisão de treino');
  });

  it('should render the division name from router navigation state', () => {
    mockNavigationState({ divisionName: 'Pernas' });
    createComponent();

    expect(queryByTestId('exercises-heading')?.textContent).toContain('Pernas');
  });

  it('should navigate back to /dashboard when the back button is clicked', () => {
    mockNavigationState({ divisionName: 'Pernas' });
    createComponent();

    (queryByTestId('back-to-divisions-button') as HTMLButtonElement).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  describe('division name fallback', () => {
    it('should not call getById when the name is available from navigation state', () => {
      mockNavigationState({ divisionName: 'Pernas' });
      createComponent();

      expect(getByIdSpy).not.toHaveBeenCalled();
    });

    it('should fetch the division name via getById when navigation state is missing', () => {
      mockNavigationState(undefined);
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });

      createComponent();

      expect(getByIdSpy).toHaveBeenCalledWith(5);
      expect(queryByTestId('exercises-heading')?.textContent).toContain('Pernas');
    });
  });

  describe('exercises list', () => {
    it('should load the exercises for the division id from the route', () => {
      mockNavigationState({ divisionName: 'Peito' });
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });

      createComponent();

      expect(getByDivisionSpy).toHaveBeenCalledWith(5);
    });

    describe('when the division has exercises', () => {
      const exercises: Exercise[] = [
        { id: 101, name: 'Supino Reto', workoutDivisionId: 5 },
        { id: 102, name: 'Crucifixo', workoutDivisionId: 5 },
      ];

      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito' });
        getByDivisionSpy.mockReturnValue(of(exercises));
        createComponent();
      });

      it('should render one row per exercise with its name', () => {
        const rows = queryAllByTestId('exercise-row');

        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain('Supino Reto');
        expect(rows[1].textContent).toContain('Crucifixo');
      });

      it('should not render the empty state', () => {
        expect(queryByTestId('exercises-empty')).toBeFalsy();
      });

      it('should not render the load-error message', () => {
        expect(queryByTestId('exercises-load-error')).toBeFalsy();
      });
    });

    describe('when the division has no exercises', () => {
      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito' });
        getByDivisionSpy.mockReturnValue(of<Exercise[]>([]));
        createComponent();
      });

      it('should render the empty state', () => {
        expect(queryByTestId('exercises-empty')?.textContent).toContain(
          'Nenhum exercício cadastrado nesta divisão ainda',
        );
      });

      it('should not render any exercise row', () => {
        expect(queryAllByTestId('exercise-row')).toHaveLength(0);
      });
    });

    describe('when loading fails', () => {
      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito' });
        getByDivisionSpy.mockReturnValue(
          throwError(() => new HttpErrorResponse({ status: 500 })),
        );
        createComponent();
      });

      it('should render a load-error message instead of the empty state', () => {
        expect(queryByTestId('exercises-load-error')?.textContent).toContain(
          'Não foi possível carregar os exercícios',
        );
        expect(queryByTestId('exercises-empty')).toBeFalsy();
      });

      it('should not render any exercise row', () => {
        expect(queryAllByTestId('exercise-row')).toHaveLength(0);
      });
    });
  });

  describe('open sets', () => {
    const exercise: Exercise = { id: 101, name: 'Supino Reto', workoutDivisionId: 5 };

    beforeEach(() => {
      mockNavigationState({ divisionName: 'Peito' });
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });
      getByDivisionSpy.mockReturnValue(of([exercise]));
      createComponent();
    });

    it('should navigate to the sets page when an exercise row is opened', () => {
      const row = queryByTestId('exercise-row') as HTMLElement;
      row.click();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/dashboard/divisions', 5, 'exercises', 101, 'sets'],
        { state: { divisionName: 'Peito', exerciseName: 'Supino Reto' } },
      );
    });
  });

  describe('create exercise', () => {
    beforeEach(() => {
      mockNavigationState({ divisionName: 'Peito' });
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });
      createComponent();
    });

    it('should open the create form from the "Adicionar Exercício" button', () => {
      expect(queryByTestId('exercise-form')).toBeFalsy();

      clickByTestId('add-exercise-button');

      expect(queryByTestId('exercise-form')).toBeTruthy();
    });

    it('should create the exercise for the current division, reload the list and close the form', () => {
      clickByTestId('add-exercise-button');

      getByDivisionSpy.mockClear();
      getByDivisionSpy.mockReturnValueOnce(
        of([{ id: 101, name: 'Supino Reto', workoutDivisionId: 5 }]),
      );

      fillAndSubmitForm('Supino Reto');

      expect(createExerciseSpy).toHaveBeenCalledWith('Supino Reto', 5);
      expect(getByDivisionSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('exercise-form')).toBeFalsy();
      expect(queryAllByTestId('exercise-row')).toHaveLength(1);
    });

    it('should keep the form open and show a conflict message on 409', () => {
      createExerciseSpy.mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );

      clickByTestId('add-exercise-button');
      fillAndSubmitForm('Supino Reto');

      expect(queryByTestId('exercise-form')).toBeTruthy();
      expect(queryByTestId('exercise-form-error')?.textContent).toContain(
        'Já existe um exercício com esse nome.',
      );
    });
  });

  describe('edit exercise', () => {
    const exercise: Exercise = { id: 101, name: 'Supino Reto', workoutDivisionId: 5 };

    beforeEach(() => {
      mockNavigationState({ divisionName: 'Peito' });
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });
      getByDivisionSpy.mockReturnValue(of([exercise]));
      createComponent();
    });

    it('should open the form in edit mode prefilled when the row edit is clicked', () => {
      clickByTestId('exercise-row-edit');

      expect(queryByTestId('exercise-form')).toBeTruthy();
      expect(queryByTestId('exercise-form-title')?.textContent).toContain('Editar Exercício');
      expect((queryByTestId('exercise-form-name') as HTMLInputElement).value).toBe('Supino Reto');
    });

    it('should update the exercise, reload and close the form on save', () => {
      clickByTestId('exercise-row-edit');

      getByDivisionSpy.mockClear();
      getByDivisionSpy.mockReturnValueOnce(
        of([{ id: 101, name: 'Supino Inclinado', workoutDivisionId: 5 }]),
      );

      fillAndSubmitForm('Supino Inclinado');

      expect(updateExerciseSpy).toHaveBeenCalledWith(101, 'Supino Inclinado');
      expect(getByDivisionSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('exercise-form')).toBeFalsy();
    });

    it('should show a conflict message on 409', () => {
      updateExerciseSpy.mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );

      clickByTestId('exercise-row-edit');
      fillAndSubmitForm('Outro nome');

      expect(queryByTestId('exercise-form-error')?.textContent).toContain(
        'Já existe um exercício com esse nome.',
      );
    });
  });

  describe('delete exercise', () => {
    const exercise: Exercise = { id: 101, name: 'Supino Reto', workoutDivisionId: 5 };

    beforeEach(() => {
      mockNavigationState({ divisionName: 'Peito' });
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ divisionId: '5' });
      getByDivisionSpy.mockReturnValue(of([exercise]));
      createComponent();
    });

    it('should open a confirmation dialog warning about the cascade when delete is clicked', () => {
      clickByTestId('exercise-row-delete');

      expect(queryByTestId('confirm-dialog')).toBeTruthy();
      expect(queryByTestId('confirm-dialog-message')?.textContent).toContain('séries');
    });

    it('should remove the exercise, reload and close the dialog on confirm', () => {
      clickByTestId('exercise-row-delete');

      getByDivisionSpy.mockClear();
      getByDivisionSpy.mockReturnValueOnce(of<Exercise[]>([]));

      clickByTestId('confirm-dialog-confirm');

      expect(removeExerciseSpy).toHaveBeenCalledWith(101);
      expect(getByDivisionSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
      expect(queryAllByTestId('exercise-row')).toHaveLength(0);
    });

    it('should close the dialog without deleting on cancel', () => {
      clickByTestId('exercise-row-delete');
      clickByTestId('confirm-dialog-cancel');

      expect(removeExerciseSpy).not.toHaveBeenCalled();
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
    });
  });
});
