import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Navigation,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { MockInstance, vi } from 'vitest';
import { of } from 'rxjs';

import { Division } from '../../core/models/division.model';
import { DivisionsService } from '../../core/services/divisions.service';
import { ExercisesComponent } from './exercises.component';

describe('ExercisesComponent', () => {
  let fixture: ComponentFixture<ExercisesComponent>;
  let compiled: HTMLElement;
  let navigateSpy: MockInstance<Router['navigate']>;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let activatedRouteMock: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };

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
    getByIdSpy = vi.fn(() => of<Division>({ id: 5, name: 'Pernas' }));
    activatedRouteMock = { snapshot: { paramMap: convertToParamMap({ id: '5' }) } };

    TestBed.configureTestingModule({
      imports: [ExercisesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DivisionsService, useValue: { getById: getByIdSpy } },
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
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '5' });

      createComponent();

      expect(getByIdSpy).toHaveBeenCalledWith(5);
      expect(queryByTestId('exercises-heading')?.textContent).toContain('Pernas');
    });
  });
});
