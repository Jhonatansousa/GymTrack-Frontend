import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Exercise } from '../../../../core/models/exercise.model';
import { ExerciseRowComponent } from './exercise-row.component';

describe('ExerciseRowComponent', () => {
  let fixture: ComponentFixture<ExerciseRowComponent>;
  let component: ExerciseRowComponent;
  let compiled: HTMLElement;

  const exercise: Exercise = { id: 101, name: 'Supino Reto', workoutDivisionId: 1 };

  function createComponent(index: number): void {
    fixture = TestBed.createComponent(ExerciseRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('exercise', exercise);
    fixture.componentRef.setInput('index', index);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ExerciseRowComponent] });
  });

  it('should render the exercise name', () => {
    createComponent(0);

    expect(queryByTestId('exercise-row')?.textContent).toContain('Supino Reto');
  });

  it('should render a 1-based, zero-padded index label', () => {
    createComponent(0);

    expect(queryByTestId('exercise-row-index')?.textContent?.trim()).toBe('01');
  });

  it('should render the correct index label for the third row', () => {
    createComponent(2);

    expect(queryByTestId('exercise-row-index')?.textContent?.trim()).toBe('03');
  });

  it('should emit edit when the rename button is clicked', () => {
    createComponent(0);
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);

    (queryByTestId('exercise-row-edit') as HTMLButtonElement).click();

    expect(editSpy).toHaveBeenCalled();
  });

  it('should emit remove when the delete button is clicked', () => {
    createComponent(0);
    const removeSpy = vi.fn();
    component.remove.subscribe(removeSpy);

    (queryByTestId('exercise-row-delete') as HTMLButtonElement).click();

    expect(removeSpy).toHaveBeenCalled();
  });
});
