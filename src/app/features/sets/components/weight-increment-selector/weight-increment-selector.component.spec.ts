import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { WeightIncrementSelectorComponent } from './weight-increment-selector.component';

describe('WeightIncrementSelectorComponent', () => {
  let fixture: ComponentFixture<WeightIncrementSelectorComponent>;
  let component: WeightIncrementSelectorComponent;
  let compiled: HTMLElement;

  function createComponent(active: number): void {
    fixture = TestBed.createComponent(WeightIncrementSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('active', active);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function queryAllChips(): HTMLButtonElement[] {
    return Array.from(compiled.querySelectorAll("[data-testid='weight-increment-option']"));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WeightIncrementSelectorComponent] });
  });

  it('should render the four increment options', () => {
    createComponent(2.5);

    const chips = queryAllChips();
    expect(chips).toHaveLength(4);
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['0.5', '1', '2.5', '5']);
  });

  it('should mark only the active option as pressed', () => {
    createComponent(2.5);

    const chips = queryAllChips();
    expect(chips.map((chip) => chip.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ]);
  });

  it('should mark a different option as pressed when it is the active one', () => {
    createComponent(5);

    const chips = queryAllChips();
    expect(chips.map((chip) => chip.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'false',
      'true',
    ]);
  });

  it('should emit select with the corresponding value when a chip is clicked', () => {
    createComponent(2.5);
    const spy = vi.fn();
    component.select.subscribe(spy);

    queryAllChips()[1].click();

    expect(spy).toHaveBeenCalledWith(1);
  });
});
