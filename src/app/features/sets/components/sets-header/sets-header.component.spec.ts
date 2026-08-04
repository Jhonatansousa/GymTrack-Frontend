import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { SetsHeaderComponent } from './sets-header.component';

describe('SetsHeaderComponent', () => {
  let fixture: ComponentFixture<SetsHeaderComponent>;
  let component: SetsHeaderComponent;
  let compiled: HTMLElement;

  function createComponent(isCreating = false): void {
    fixture = TestBed.createComponent(SetsHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('divisionName', 'Peito');
    fixture.componentRef.setInput('exerciseName', 'Supino Reto');
    fixture.componentRef.setInput('isCreating', isCreating);
    fixture.componentRef.setInput('weightIncrement', 2.5);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SetsHeaderComponent] });
  });

  it('should render the "Exercício" eyebrow', () => {
    createComponent();

    expect(queryByTestId('sets-eyebrow')?.textContent).toContain('Exercício');
  });

  it('should render the exercise name as the heading', () => {
    createComponent();

    expect(queryByTestId('sets-heading')?.textContent).toContain('Supino Reto');
  });

  it('should render the division name as the back button label', () => {
    createComponent();

    expect(queryByTestId('back-to-exercises-button')?.textContent).toContain('Peito');
  });

  it('should emit back when the back button is clicked', () => {
    createComponent();
    const spy = vi.fn();
    component.back.subscribe(spy);

    (queryByTestId('back-to-exercises-button') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit addSet when the add button is clicked', () => {
    createComponent();
    const spy = vi.fn();
    component.addSet.subscribe(spy);

    (queryByTestId('add-set-button') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalled();
  });

  it('should disable the add button while isCreating is true', () => {
    createComponent(true);

    expect((queryByTestId('add-set-button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should render the weight increment selector with the current increment active', () => {
    createComponent();

    const activeChip = compiled.querySelector("[data-testid='weight-increment-option'][aria-pressed='true']");
    expect(activeChip?.textContent?.trim()).toBe('2.5');
  });

  it('should emit weightIncrementSelected when a chip is clicked', () => {
    createComponent();
    const spy = vi.fn();
    component.weightIncrementSelected.subscribe(spy);

    const chips = Array.from(
      compiled.querySelectorAll("[data-testid='weight-increment-option']"),
    ) as HTMLButtonElement[];
    chips[3].click();

    expect(spy).toHaveBeenCalledWith(5);
  });
});
