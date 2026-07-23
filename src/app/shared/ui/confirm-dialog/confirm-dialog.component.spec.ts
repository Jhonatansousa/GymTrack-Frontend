import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] });

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Excluir divisão');
    fixture.componentRef.setInput('message', 'Isso vai apagar os exercícios e séries.');
    fixture.componentRef.setInput('confirmLabel', 'Excluir');
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  it('should render the title and message', () => {
    expect(queryByTestId('confirm-dialog-title')?.textContent).toContain('Excluir divisão');
    expect(queryByTestId('confirm-dialog-message')?.textContent).toContain(
      'Isso vai apagar os exercícios e séries.',
    );
  });

  it('should render the confirm label', () => {
    expect(queryByTestId('confirm-dialog-confirm')?.textContent).toContain('Excluir');
  });

  it('should emit confirm when the confirm button is clicked', () => {
    const confirmSpy = vi.fn();
    component.confirm.subscribe(confirmSpy);

    (queryByTestId('confirm-dialog-confirm') as HTMLButtonElement).click();

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should emit cancel when the cancel button is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    (queryByTestId('confirm-dialog-cancel') as HTMLButtonElement).click();

    expect(cancelSpy).toHaveBeenCalled();
  });

  describe('accessibility', () => {
    it('should focus the cancel button on init, as a safer default for a destructive action', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');

      const freshFixture = TestBed.createComponent(ConfirmDialogComponent);
      freshFixture.componentRef.setInput('title', 'Excluir divisão');
      freshFixture.componentRef.setInput('message', 'Isso vai apagar os exercícios e séries.');
      freshFixture.componentRef.setInput('confirmLabel', 'Excluir');
      freshFixture.detectChanges();

      const cancelButton = (freshFixture.nativeElement as HTMLElement).querySelector(
        "[data-testid='confirm-dialog-cancel']",
      );

      expect(focusSpy.mock.instances).toContain(cancelButton);
    });

    it('should emit cancel when Escape is pressed', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('confirming state', () => {
    it('should disable the confirm button while isConfirming is true', () => {
      fixture.componentRef.setInput('isConfirming', true);
      fixture.detectChanges();

      expect((queryByTestId('confirm-dialog-confirm') as HTMLButtonElement).disabled).toBe(true);
    });

    it('should keep the confirm button enabled by default', () => {
      expect((queryByTestId('confirm-dialog-confirm') as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
