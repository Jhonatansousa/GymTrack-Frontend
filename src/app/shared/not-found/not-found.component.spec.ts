import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(NotFoundComponent);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  it('should render a not-found message in Portuguese', () => {
    const message = queryByTestId('not-found-message');

    expect(message).toBeTruthy();
    expect(message?.textContent).toContain('não encontrada');
  });

  it('should render a link back to the initial route', () => {
    const backLink = queryByTestId('not-found-back-link');

    expect(backLink).toBeTruthy();
    expect(backLink?.getAttribute('href')).toBe('/auth');
  });
});
