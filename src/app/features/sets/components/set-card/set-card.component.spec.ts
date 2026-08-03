import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSet } from '../../../../core/models/workout-set.model';
import { SetCardComponent } from './set-card.component';

describe('SetCardComponent', () => {
  let fixture: ComponentFixture<SetCardComponent>;
  let compiled: HTMLElement;

  const set: WorkoutSet = { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 };

  function createComponent(index: number): void {
    fixture = TestBed.createComponent(SetCardComponent);
    fixture.componentRef.setInput('set', set);
    fixture.componentRef.setInput('index', index);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SetCardComponent] });
  });

  it('should render the set name', () => {
    createComponent(0);

    expect(queryByTestId('set-card')?.textContent).toContain('1');
  });

  it('should render a 1-based, zero-padded index label', () => {
    createComponent(0);

    expect(queryByTestId('set-card-index')?.textContent?.trim()).toBe('01');
  });

  it('should render the correct index label for the third card', () => {
    createComponent(2);

    expect(queryByTestId('set-card-index')?.textContent?.trim()).toBe('03');
  });
});
