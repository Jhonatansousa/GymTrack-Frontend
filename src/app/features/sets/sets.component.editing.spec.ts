import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Navigation, Router, convertToParamMap, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { Division } from '../../core/models/division.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { Exercise } from '../../core/models/exercise.model';
import { ExercisesService } from '../../core/services/exercises.service';
import { WorkoutSet } from '../../core/models/workout-set.model';
import { SetsService } from '../../core/services/sets.service';
import { SetsComponent } from './sets.component';

describe('SetsComponent — editing', () => {
  let fixture: ComponentFixture<SetsComponent>;
  let compiled: HTMLElement;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let getByDivisionSpy: ReturnType<typeof vi.fn>;
  let getByExerciseSpy: ReturnType<typeof vi.fn>;
  let createSetSpy: ReturnType<typeof vi.fn>;
  let updateSetSpy: ReturnType<typeof vi.fn>;
  let removeSetSpy: ReturnType<typeof vi.fn>;
  let activatedRouteMock: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

  const set: WorkoutSet = { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 };

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
    getByExerciseSpy = vi.fn(() => of<WorkoutSet[]>([set]));
    createSetSpy = vi.fn(() =>
      of<WorkoutSet>({ id: 1002, name: '2', reps: 0, weight: 0, exerciseId: 101 }),
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
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    mockNavigationState({ divisionName: 'Peito', exerciseName: 'Supino Reto' });
    createComponent();
  });

  describe('delete set', () => {
    it('should open a confirmation dialog when the card delete button is clicked', () => {
      clickByTestId('set-card-delete');

      expect(queryByTestId('confirm-dialog')).toBeTruthy();
    });

    it('should remove the set, reload and close the dialog on confirm', () => {
      clickByTestId('set-card-delete');

      getByExerciseSpy.mockClear();
      getByExerciseSpy.mockReturnValueOnce(of<WorkoutSet[]>([]));

      clickByTestId('confirm-dialog-confirm');

      expect(removeSetSpy).toHaveBeenCalledWith(1001);
      expect(getByExerciseSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
      expect(queryAllByTestId('set-card')).toHaveLength(0);
    });

    it('should close the dialog without deleting on cancel', () => {
      clickByTestId('set-card-delete');
      clickByTestId('confirm-dialog-cancel');

      expect(removeSetSpy).not.toHaveBeenCalled();
      expect(queryByTestId('confirm-dialog')).toBeFalsy();
    });
  });
});
