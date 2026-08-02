import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Division } from '../../../../core/models/division.model';
import { DivisionCardComponent } from './division-card.component';

describe('DivisionCardComponent', () => {
  let fixture: ComponentFixture<DivisionCardComponent>;
  let component: DivisionCardComponent;
  let compiled: HTMLElement;

  const division: Division = { id: 1, name: 'Peito / Tríceps' };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DivisionCardComponent] });

    fixture = TestBed.createComponent(DivisionCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('division', division);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  it('should render the division name', () => {
    expect(queryByTestId('division-card')?.textContent).toContain('Peito / Tríceps');
  });

  it('should render the "Ver exercícios" call to action', () => {
    expect(compiled.textContent).toContain('Ver exercícios');
  });

  it('should emit edit when the edit button is clicked', () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);

    (queryByTestId('division-card-edit') as HTMLButtonElement).click();

    expect(editSpy).toHaveBeenCalled();
  });

  it('should emit remove when the delete button is clicked', () => {
    const removeSpy = vi.fn();
    component.remove.subscribe(removeSpy);

    (queryByTestId('division-card-delete') as HTMLButtonElement).click();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('should emit open when the card is clicked', () => {
    const openSpy = vi.fn();
    component.open.subscribe(openSpy);

    (queryByTestId('division-card') as HTMLElement).click();

    expect(openSpy).toHaveBeenCalled();
  });

  it('should not emit open when the edit button is clicked', () => {
    const openSpy = vi.fn();
    component.open.subscribe(openSpy);

    (queryByTestId('division-card-edit') as HTMLButtonElement).click();

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should not emit open when the delete button is clicked', () => {
    const openSpy = vi.fn();
    component.open.subscribe(openSpy);

    (queryByTestId('division-card-delete') as HTMLButtonElement).click();

    expect(openSpy).not.toHaveBeenCalled();
  });

  describe('keyboard accessibility', () => {
    function card(): HTMLElement {
      return queryByTestId('division-card') as HTMLElement;
    }

    function pressKey(target: HTMLElement, key: string): void {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    }

    it('should expose the card as a focusable button to assistive technology', () => {
      expect(card().getAttribute('role')).toBe('button');
      expect(card().getAttribute('tabindex')).toBe('0');
    });

    it('should label the card with the division name', () => {
      expect(card().getAttribute('aria-label')).toContain('Peito / Tríceps');
    });

    it('should emit open when Enter is pressed on the card', () => {
      const openSpy = vi.fn();
      component.open.subscribe(openSpy);

      pressKey(card(), 'Enter');

      expect(openSpy).toHaveBeenCalled();
    });

    it('should emit open when Space is pressed on the card', () => {
      const openSpy = vi.fn();
      component.open.subscribe(openSpy);

      pressKey(card(), ' ');

      expect(openSpy).toHaveBeenCalled();
    });

    it('should not emit open when Enter is pressed on the edit button', () => {
      const openSpy = vi.fn();
      component.open.subscribe(openSpy);

      pressKey(queryByTestId('division-card-edit') as HTMLElement, 'Enter');

      expect(openSpy).not.toHaveBeenCalled();
    });

    it('should not emit open when Enter is pressed on the delete button', () => {
      const openSpy = vi.fn();
      component.open.subscribe(openSpy);

      pressKey(queryByTestId('division-card-delete') as HTMLElement, 'Enter');

      expect(openSpy).not.toHaveBeenCalled();
    });
  });
});
