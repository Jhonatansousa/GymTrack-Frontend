import { TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
    }).compileComponents();
  });

  it('should start in Login mode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Login');
    expect(compiled.textContent).not.toContain('Registro');

    const toggleButton = compiled.querySelector('button');
    expect(toggleButton).toBeTruthy();
    expect(toggleButton?.textContent).toContain('Criar conta');
  });

  it('should switch DOM to Registro mode when clicking the toggle button', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('button');

    expect(toggleButton).toBeTruthy();

    toggleButton?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Registro');
    expect(compiled.textContent).not.toContain('Login');
  });

  it('should render an email input field in Login mode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector("input[type='email']");

    expect(emailInput).toBeTruthy();
  });

  it('should render a password input field in Login mode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector("input[type='password']");

    expect(passwordInput).toBeTruthy();
  });
});
