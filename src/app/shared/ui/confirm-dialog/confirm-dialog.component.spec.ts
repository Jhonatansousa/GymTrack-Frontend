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
});
