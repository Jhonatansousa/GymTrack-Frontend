import { TestBed } from '@angular/core/testing';

import { AuthPageComponent } from './auth-page.component';

describe('AuthPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPageComponent],
    }).compileComponents();
  });

  it('should start in Login mode', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Login');
    expect(compiled.textContent).not.toContain('Registro');

    const toggleButton = compiled.querySelector('button');
    expect(toggleButton).toBeTruthy();
    expect(toggleButton?.textContent).toContain('Criar conta');
  });

  it('should switch DOM to Registro mode when clicking the toggle button', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('button');

    expect(toggleButton).toBeTruthy();

    toggleButton?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Registro');
    expect(compiled.textContent).not.toContain('Login');
  });
});
