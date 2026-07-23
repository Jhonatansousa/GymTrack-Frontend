import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DivisionFormComponent } from './division-form.component';

type DivisionFormControlKey = keyof DivisionFormComponent['form']['controls'];

describe('DivisionFormComponent', () => {
  let fixture: ComponentFixture<DivisionFormComponent>;
  let component: DivisionFormComponent;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DivisionFormComponent] });

    fixture = TestBed.createComponent(DivisionFormComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function nameInput(): HTMLInputElement {
    return queryByTestId('division-form-name') as HTMLInputElement;
  }

  function submitButton(): HTMLButtonElement {
    return queryByTestId('division-form-submit') as HTMLButtonElement;
  }

  function setControlValue(key: DivisionFormControlKey, value: string, touched = true): void {
    const control = component.form.controls[key];
    control.setValue(value);
    if (touched) control.markAsTouched();
    fixture.detectChanges();
  }

  it('should render the dialog with a name input and a submit button', () => {
    expect(queryByTestId('division-form')).toBeTruthy();
    expect(nameInput()).toBeTruthy();
    expect(submitButton()).toBeTruthy();
  });

  it('should not emit save when submitting an empty name', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    submitButton().click();
    fixture.detectChanges();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(queryByTestId('division-form-name-error')).toBeTruthy();
  });

  it('should emit save with the trimmed name when valid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    setControlValue('name', '  Pernas  ');
    submitButton().click();

    expect(saveSpy).toHaveBeenCalledWith('Pernas');
  });

  it('should emit cancel when the cancel button is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    (queryByTestId('division-form-cancel') as HTMLButtonElement).click();

    expect(cancelSpy).toHaveBeenCalled();
  });

  describe('accessibility', () => {
    it('should focus the name input on init', () => {
      const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

      const freshFixture = TestBed.createComponent(DivisionFormComponent);
      freshFixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should emit cancel when Escape is pressed', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

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

      setControlValue('name', 'Pernas');
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
      fixture.componentRef.setInput('heading', 'Editar Divisão');
      fixture.componentRef.setInput('submitLabel', 'Salvar');
      fixture.detectChanges();

      expect(queryByTestId('division-form-title')?.textContent).toContain('Editar Divisão');
      expect(submitButton().textContent).toContain('Salvar');
    });

    it('should prefill the name from the initialName input', () => {
      fixture.componentRef.setInput('initialName', 'Pernas');
      fixture.detectChanges();

      expect(nameInput().value).toBe('Pernas');
      expect(component.form.controls.name.value).toBe('Pernas');
    });
  });
});
