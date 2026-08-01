import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navigation, Router, provideRouter } from '@angular/router';
import { MockInstance, vi } from 'vitest';

import { ExercisesComponent } from './exercises.component';

describe('ExercisesComponent', () => {
  let fixture: ComponentFixture<ExercisesComponent>;
  let compiled: HTMLElement;
  let navigateSpy: MockInstance<Router['navigate']>;

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExercisesComponent],
      providers: [provideRouter([])],
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
});
