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

  it('should render an Entrar submit button in Login mode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']");

    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toContain('Entrar');
  });

  it('should disable login button when email field is empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable login button when password field is empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable login button when email and password fields are empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });
});
