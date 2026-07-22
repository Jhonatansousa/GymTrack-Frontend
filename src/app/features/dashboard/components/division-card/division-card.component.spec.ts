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
});
