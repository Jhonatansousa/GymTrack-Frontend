import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Navigation, Router, convertToParamMap, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

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

  describe('rename set', () => {
    it('should update the set name and reload the list when the card emits rename', () => {
      getByExerciseSpy.mockClear();
      getByExerciseSpy.mockReturnValueOnce(
        of<WorkoutSet[]>([{ ...set, name: 'Aquecimento' }]),
      );

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();
      const input = queryByTestId('set-card-name-input') as HTMLInputElement;
      input.value = 'Aquecimento';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(updateSetSpy).toHaveBeenCalledWith(1001, { newName: 'Aquecimento' });
      expect(getByExerciseSpy).toHaveBeenCalledTimes(1);
      expect(queryAllByTestId('set-card')[0].textContent).toContain('Aquecimento');
    });
  });

  describe('update set fields (weight & reps)', () => {
    const setA: WorkoutSet = { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 };
    const setB: WorkoutSet = { id: 1002, name: '2', reps: 8, weight: 70, exerciseId: 101 };

    function stepperIncrementButtons(): HTMLButtonElement[] {
      return Array.from(compiled.querySelectorAll("[data-testid='stepper-field-increment']"));
    }

    function clickAndDetect(button: HTMLButtonElement): void {
      button.click();
      fixture.detectChanges();
    }

    beforeEach(() => {
      vi.useFakeTimers();
      getByExerciseSpy.mockReturnValue(of([setA, setB]));
      createComponent();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update the value on screen immediately, before any HTTP call', () => {
      clickAndDetect(stepperIncrementButtons()[0]);

      expect(queryAllByTestId('stepper-field-value')[0].textContent?.trim()).toBe('62.5');
      expect(updateSetSpy).not.toHaveBeenCalled();
    });

    it('should not call update immediately after the change', () => {
      clickAndDetect(stepperIncrementButtons()[0]);

      expect(updateSetSpy).not.toHaveBeenCalled();
    });

    it('should call update once, 500ms after the last change', () => {
      clickAndDetect(stepperIncrementButtons()[0]);

      vi.advanceTimersByTime(500);

      expect(updateSetSpy).toHaveBeenCalledTimes(1);
      expect(updateSetSpy).toHaveBeenCalledWith(1001, { reps: 10, weight: 62.5 });
    });

    it('should coalesce five rapid clicks into a single request with the final value', () => {
      const incrementButton = stepperIncrementButtons()[0];
      for (let i = 0; i < 5; i++) {
        clickAndDetect(incrementButton);
      }

      vi.advanceTimersByTime(500);

      expect(updateSetSpy).toHaveBeenCalledTimes(1);
      expect(updateSetSpy).toHaveBeenCalledWith(1001, { reps: 10, weight: 72.5 });
    });

    it('should send independent requests for changes on different sets', () => {
      clickAndDetect(stepperIncrementButtons()[0]);
      clickAndDetect(stepperIncrementButtons()[2]);

      vi.advanceTimersByTime(500);

      expect(updateSetSpy).toHaveBeenCalledTimes(2);
      expect(updateSetSpy).toHaveBeenCalledWith(1001, { reps: 10, weight: 62.5 });
      expect(updateSetSpy).toHaveBeenCalledWith(1002, { reps: 8, weight: 72.5 });
    });

    it('should reload the list to resync when the persist request fails', () => {
      updateSetSpy.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
      getByExerciseSpy.mockClear();
      getByExerciseSpy.mockReturnValueOnce(of([setA, setB]));

      clickAndDetect(stepperIncrementButtons()[0]);
      vi.advanceTimersByTime(500);

      expect(getByExerciseSpy).toHaveBeenCalledTimes(1);
    });

    it('should use the selected weight increment as the step for the next weight change', () => {
      const chips = queryAllByTestId('weight-increment-option');
      clickAndDetect(chips[3] as HTMLButtonElement);

      clickAndDetect(stepperIncrementButtons()[0]);
      vi.advanceTimersByTime(500);

      expect(updateSetSpy).toHaveBeenCalledWith(1001, { reps: 10, weight: 65 });
    });
  });
});
