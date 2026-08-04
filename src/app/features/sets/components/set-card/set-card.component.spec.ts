import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { WorkoutSet } from '../../../../core/models/workout-set.model';
import { SetCardComponent } from './set-card.component';

describe('SetCardComponent', () => {
  let fixture: ComponentFixture<SetCardComponent>;
  let compiled: HTMLElement;

  const set: WorkoutSet = { id: 1001, name: '1', reps: 10, weight: 60, exerciseId: 101 };

  function createComponent(index: number, weightIncrement = 2.5): void {
    fixture = TestBed.createComponent(SetCardComponent);
    fixture.componentRef.setInput('set', set);
    fixture.componentRef.setInput('index', index);
    fixture.componentRef.setInput('weightIncrement', weightIncrement);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function stepperIncrementButtons(): HTMLButtonElement[] {
    return Array.from(compiled.querySelectorAll("[data-testid='stepper-field-increment']"));
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

  it('should emit remove when the delete button is clicked', () => {
    createComponent(0);
    const component = fixture.componentInstance;
    const removeSpy = vi.fn();
    component.remove.subscribe(removeSpy);

    (queryByTestId('set-card-delete') as HTMLButtonElement).click();

    expect(removeSpy).toHaveBeenCalled();
  });

  describe('inline rename', () => {
    function nameInput(): HTMLInputElement {
      return queryByTestId('set-card-name-input') as HTMLInputElement;
    }

    function setInputValue(value: string): void {
      const input = nameInput();
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    function pressKey(key: string): void {
      nameInput().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    }

    it('should not show the name input by default', () => {
      createComponent(0);

      expect(queryByTestId('set-card-name-input')).toBeFalsy();
    });

    it('should show the name input, prefilled with the current name, when the rename button is clicked', () => {
      createComponent(0);

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(nameInput()).toBeTruthy();
      expect(nameInput().value).toBe('1');
    });

    it('should emit rename with the trimmed value and leave rename mode on Enter', () => {
      createComponent(0);
      const component = fixture.componentInstance;
      const renameSpy = vi.fn();
      component.rename.subscribe(renameSpy);

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();
      setInputValue('  Aquecimento  ');
      pressKey('Enter');

      expect(renameSpy).toHaveBeenCalledWith('Aquecimento');
      expect(queryByTestId('set-card-name-input')).toBeFalsy();
    });

    it('should leave rename mode without emitting rename on Escape', () => {
      createComponent(0);
      const component = fixture.componentInstance;
      const renameSpy = vi.fn();
      component.rename.subscribe(renameSpy);

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();
      setInputValue('Aquecimento');
      pressKey('Escape');

      expect(renameSpy).not.toHaveBeenCalled();
      expect(queryByTestId('set-card-name-input')).toBeFalsy();
    });

    it('should emit rename on blur', () => {
      createComponent(0);
      const component = fixture.componentInstance;
      const renameSpy = vi.fn();
      component.rename.subscribe(renameSpy);

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();
      setInputValue('Aquecimento');
      nameInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(renameSpy).toHaveBeenCalledWith('Aquecimento');
    });

    it('should not emit rename when the name is empty or only whitespace', () => {
      createComponent(0);
      const component = fixture.componentInstance;
      const renameSpy = vi.fn();
      component.rename.subscribe(renameSpy);

      (queryByTestId('set-card-edit') as HTMLButtonElement).click();
      fixture.detectChanges();
      setInputValue('   ');
      pressKey('Enter');

      expect(renameSpy).not.toHaveBeenCalled();
    });
  });

  describe('weight and reps steppers', () => {
    it('should render a "Carga (kg)" stepper and a "Repetições" stepper', () => {
      createComponent(0);

      const fields = Array.from(compiled.querySelectorAll("[data-testid='stepper-field']"));
      expect(fields).toHaveLength(2);
      expect(fields[0].textContent).toContain('Carga (kg)');
      expect(fields[1].textContent).toContain('Repetições');
    });

    it('should emit weightChange using the weightIncrement input as the step', () => {
      createComponent(0, 5);
      const component = fixture.componentInstance;
      const spy = vi.fn();
      component.weightChange.subscribe(spy);

      stepperIncrementButtons()[0].click();

      expect(spy).toHaveBeenCalledWith(65);
    });

    it('should emit repsChange using a fixed step of 1 regardless of weightIncrement', () => {
      createComponent(0, 5);
      const component = fixture.componentInstance;
      const spy = vi.fn();
      component.repsChange.subscribe(spy);

      stepperIncrementButtons()[1].click();

      expect(spy).toHaveBeenCalledWith(11);
    });
  });
});
