import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { StepperFieldComponent } from './stepper-field.component';

describe('StepperFieldComponent', () => {
  let fixture: ComponentFixture<StepperFieldComponent>;
  let component: StepperFieldComponent;
  let compiled: HTMLElement;

  function createComponent(
    value: number,
    step = 1,
    allowDecimals = false,
  ): void {
    fixture = TestBed.createComponent(StepperFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Carga (kg)');
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('step', step);
    fixture.componentRef.setInput('allowDecimals', allowDecimals);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function valueInput(): HTMLInputElement {
    return queryByTestId('stepper-field-input') as HTMLInputElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepperFieldComponent] });
  });

  it('should render the label and the formatted value', () => {
    createComponent(60);

    expect(queryByTestId('stepper-field')?.textContent).toContain('Carga (kg)');
    expect(queryByTestId('stepper-field-value')?.textContent).toContain('60');
  });

  it('should emit valueChange incremented by step when the + button is clicked', () => {
    createComponent(60, 2.5);
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    (queryByTestId('stepper-field-increment') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith(62.5);
  });

  it('should emit valueChange decremented by step when the − button is clicked', () => {
    createComponent(60, 2.5);
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    (queryByTestId('stepper-field-decrement') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith(57.5);
  });

  it('should never emit a negative value when decrementing from zero', () => {
    createComponent(0, 2.5);
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    (queryByTestId('stepper-field-decrement') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should avoid floating point rounding errors when incrementing', () => {
    createComponent(0.1, 0.2);
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    (queryByTestId('stepper-field-increment') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith(0.3);
  });

  it('should format an integer value without decimal places', () => {
    createComponent(60);

    expect(queryByTestId('stepper-field-value')?.textContent?.trim()).toBe('60');
  });

  it('should format a decimal value with one decimal place', () => {
    createComponent(62.5, 0.5, true);

    expect(queryByTestId('stepper-field-value')?.textContent?.trim()).toBe('62.5');
  });

  describe('inline edit', () => {
    it('should not show the numeric input by default', () => {
      createComponent(60);

      expect(queryByTestId('stepper-field-input')).toBeFalsy();
    });

    it('should show a numeric input prefilled with the current value when the value is clicked', () => {
      createComponent(60);

      (queryByTestId('stepper-field-value') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(valueInput()).toBeTruthy();
      expect(valueInput().value).toBe('60');
    });

    it('should emit the typed value and leave edit mode on Enter', () => {
      createComponent(60);
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      (queryByTestId('stepper-field-value') as HTMLButtonElement).click();
      fixture.detectChanges();
      valueInput().value = '75';
      valueInput().dispatchEvent(new Event('input'));
      valueInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(75);
      expect(queryByTestId('stepper-field-input')).toBeFalsy();
    });

    it('should leave edit mode without emitting on Escape', () => {
      createComponent(60);
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      (queryByTestId('stepper-field-value') as HTMLButtonElement).click();
      fixture.detectChanges();
      valueInput().value = '75';
      valueInput().dispatchEvent(new Event('input'));
      valueInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(queryByTestId('stepper-field-input')).toBeFalsy();
    });

    it('should emit 0 when the typed value is not a valid number', () => {
      createComponent(60);
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      (queryByTestId('stepper-field-value') as HTMLButtonElement).click();
      fixture.detectChanges();
      valueInput().value = 'abc';
      valueInput().dispatchEvent(new Event('input'));
      valueInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should emit 0 when the typed value is negative', () => {
      createComponent(60);
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      (queryByTestId('stepper-field-value') as HTMLButtonElement).click();
      fixture.detectChanges();
      valueInput().value = '-10';
      valueInput().dispatchEvent(new Event('input'));
      valueInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(0);
    });
  });
});
