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
import { WorkoutSet } from '../../core/models/workout-set.model';
import { SetsService } from '../../core/services/sets.service';
import { SetsComponent } from './sets.component';

describe('SetsComponent', () => {
  let fixture: ComponentFixture<SetsComponent>;
  let compiled: HTMLElement;
  let navigateSpy: MockInstance<Router['navigate']>;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let getByDivisionSpy: ReturnType<typeof vi.fn>;
  let getByExerciseSpy: ReturnType<typeof vi.fn>;
  let createSetSpy: ReturnType<typeof vi.fn>;
  let updateSetSpy: ReturnType<typeof vi.fn>;
  let removeSetSpy: ReturnType<typeof vi.fn>;
  let activatedRouteMock: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

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
    fixture = TestBed.createComponent(SetsComponent);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function clickByTestId(testId: string): void {
    (queryByTestId(testId) as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    getByIdSpy = vi.fn(() => of<Division>({ id: 5, name: 'Peito' }));
    getByDivisionSpy = vi.fn(() =>
      of<Exercise[]>([{ id: 101, name: 'Supino Reto', workoutDivisionId: 5 }]),
    );
    getByExerciseSpy = vi.fn(() => of<WorkoutSet[]>([]));
    createSetSpy = vi.fn(() =>
      of<WorkoutSet>({ id: 1001, name: '1', reps: 0, weight: 0, exerciseId: 101 }),
    );
    updateSetSpy = vi.fn(() => of<void>(undefined));
    removeSetSpy = vi.fn(() => of<void>(undefined));
    activatedRouteMock = {
      snapshot: { paramMap: convertToParamMap({ divisionId: '5', exerciseId: '101' }) },
    };

    TestBed.configureTestingModule({
      imports: [SetsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DivisionsService, useValue: { getById: getByIdSpy } },
        { provide: ExercisesService, useValue: { getByDivision: getByDivisionSpy } },
        {
          provide: SetsService,
          useValue: {
            getByExercise: getByExerciseSpy,
            create: createSetSpy,
            update: updateSetSpy,
            remove: removeSetSpy,
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should render the "Exercício" eyebrow', () => {
    mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
    createComponent();

    expect(queryByTestId('sets-eyebrow')?.textContent).toContain('Exercício');
  });

  it('should render the exercise name from router navigation state', () => {
    mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
    createComponent();

    expect(queryByTestId('sets-heading')?.textContent).toContain('Supino Reto');
  });

  it('should render the division name from navigation state as the back button label', () => {
    mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
    createComponent();

    expect(queryByTestId('back-to-exercises-button')?.textContent).toContain('Peito');
  });

  it('should navigate back to the exercises page of the current division when back is clicked', () => {
    mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
    createComponent();

    (queryByTestId('back-to-exercises-button') as HTMLButtonElement).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/divisions', 5, 'exercises']);
  });

  describe('names fallback (e.g. after a page reload)', () => {
    it('should not call getById nor getByDivision when names are available from navigation state', () => {
      mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
      createComponent();

      expect(getByIdSpy).not.toHaveBeenCalled();
      expect(getByDivisionSpy).not.toHaveBeenCalled();
    });

    it('should fetch the division and exercise names when navigation state is missing', () => {
      mockNavigationState(undefined);

      createComponent();

      expect(getByIdSpy).toHaveBeenCalledWith(5);
      expect(getByDivisionSpy).toHaveBeenCalledWith(5);
      expect(queryByTestId('sets-heading')?.textContent).toContain('Supino Reto');
      expect(queryByTestId('back-to-exercises-button')?.textContent).toContain('Peito');
    });
  });

  describe('sets list', () => {
    it('should load the sets for the exercise id from the route', () => {
      mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });

      createComponent();

      expect(getByExerciseSpy).toHaveBeenCalledWith(101);
    });

    describe('when the exercise has sets', () => {
      const sets: WorkoutSet[] = [
        { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 },
        { id: 1002, name: '2', reps: 8, weight: 70, exerciseId: 101 },
      ];

      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
        getByExerciseSpy.mockReturnValue(of(sets));
        createComponent();
      });

      it('should render one card per set with its name', () => {
        const cards = queryAllByTestId('set-card');

        expect(cards).toHaveLength(2);
        expect(cards[0].textContent).toContain('1');
        expect(cards[1].textContent).toContain('2');
      });

      it('should not render the empty state', () => {
        expect(queryByTestId('sets-empty')).toBeFalsy();
      });

      it('should not render the load-error message', () => {
        expect(queryByTestId('sets-load-error')).toBeFalsy();
      });
    });

    describe('when the exercise has no sets', () => {
      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
        getByExerciseSpy.mockReturnValue(of<WorkoutSet[]>([]));
        createComponent();
      });

      it('should render the empty state', () => {
        expect(queryByTestId('sets-empty')?.textContent).toContain(
          'Nenhuma série cadastrada ainda',
        );
      });

      it('should not render any set card', () => {
        expect(queryAllByTestId('set-card')).toHaveLength(0);
      });
    });

    describe('when loading fails', () => {
      beforeEach(() => {
        mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
        getByExerciseSpy.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        createComponent();
      });

      it('should render a load-error message instead of the empty state', () => {
        expect(queryByTestId('sets-load-error')?.textContent).toContain(
          'Não foi possível carregar as séries',
        );
        expect(queryByTestId('sets-empty')).toBeFalsy();
      });

      it('should not render any set card', () => {
        expect(queryAllByTestId('set-card')).toHaveLength(0);
      });
    });
  });

  describe('create set', () => {
    beforeEach(() => {
      mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
      createComponent();
    });

    it('should render an "Adicionar Série" button', () => {
      expect(queryByTestId('add-set-button')?.textContent).toContain('Adicionar Série');
    });

    it('should create a set for the current exercise with a single click and no form', () => {
      getByExerciseSpy.mockClear();
      getByExerciseSpy.mockReturnValueOnce(
        of([{ id: 1001, name: '1', reps: 0, weight: 0, exerciseId: 101 }]),
      );

      clickByTestId('add-set-button');

      expect(createSetSpy).toHaveBeenCalledWith(101);
      expect(getByExerciseSpy).toHaveBeenCalledTimes(1);
      expect(queryAllByTestId('set-card')).toHaveLength(1);
    });

    it('should not render any form or dialog when adding a set', () => {
      clickByTestId('add-set-button');

      expect(queryByTestId('set-form')).toBeFalsy();
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
    });
  });
});
