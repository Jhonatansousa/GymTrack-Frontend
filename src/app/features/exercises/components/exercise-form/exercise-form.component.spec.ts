import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ExerciseFormComponent } from './exercise-form.component';

type ExerciseFormControlKey = keyof ExerciseFormComponent['form']['controls'];

describe('ExerciseFormComponent', () => {
  let fixture: ComponentFixture<ExerciseFormComponent>;
  let component: ExerciseFormComponent;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ExerciseFormComponent] });

    fixture = TestBed.createComponent(ExerciseFormComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function nameInput(): HTMLInputElement {
    return queryByTestId('exercise-form-name') as HTMLInputElement;
  }

  function submitButton(): HTMLButtonElement {
    return queryByTestId('exercise-form-submit') as HTMLButtonElement;
  }

  function setControlValue(key: ExerciseFormControlKey, value: string, touched = true): void {
    const control = component.form.controls[key];
    control.setValue(value);
    if (touched) control.markAsTouched();
    fixture.detectChanges();
  }

  it('should render the dialog with a name input and a submit button', () => {
    expect(queryByTestId('exercise-form')).toBeTruthy();
    expect(nameInput()).toBeTruthy();
    expect(submitButton()).toBeTruthy();
  });

  it('should not emit save when submitting an empty name', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    submitButton().click();
    fixture.detectChanges();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(queryByTestId('exercise-form-name-error')).toBeTruthy();
  });

  it('should emit save with the trimmed name when valid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    setControlValue('name', '  Supino Reto  ');
    submitButton().click();

    expect(saveSpy).toHaveBeenCalledWith('Supino Reto');
  });

  it('should emit cancel when the cancel button is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancelled.subscribe(cancelSpy);

    (queryByTestId('exercise-form-cancel') as HTMLButtonElement).click();

    expect(cancelSpy).toHaveBeenCalled();
  });

  describe('accessibility', () => {
    it('should focus the name input on init', () => {
      const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

      const freshFixture = TestBed.createComponent(ExerciseFormComponent);
      freshFixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should emit cancel when Escape is pressed', () => {
      const cancelSpy = vi.fn();
      component.cancelled.subscribe(cancelSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('submitting state', () => {
    it('should disable the submit button while isSubmitting is true', () => {
      fixture.componentRef.setInput('isSubmitting', true);
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);
    });

    it('should not emit save when submitting is already in flight', () => {
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      setControlValue('name', 'Supino Reto');
      fixture.componentRef.setInput('isSubmitting', true);
      fixture.detectChanges();

      submitButton().click();

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should keep the submit button enabled by default', () => {
      expect(submitButton().disabled).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('should render a custom heading and submit label', () => {
      fixture.componentRef.setInput('heading', 'Editar Exercício');
      fixture.componentRef.setInput('submitLabel', 'Salvar');
      fixture.detectChanges();

      expect(queryByTestId('exercise-form-title')?.textContent).toContain('Editar Exercício');
      expect(submitButton().textContent).toContain('Salvar');
    });

    it('should prefill the name from the initialName input', () => {
      fixture.componentRef.setInput('initialName', 'Supino Reto');
      fixture.detectChanges();

      expect(nameInput().value).toBe('Supino Reto');
      expect(component.form.controls.name.value).toBe('Supino Reto');
    });
  });
});
