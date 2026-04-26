import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { MockInstance, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let loginSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: MockInstance<Router['navigate']>;
  let activatedRouteMock: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let compiled: HTMLElement;

  beforeEach(() => {
    loginSpy = vi.fn(() => of({ results: {} }));
    activatedRouteMock = { snapshot: { queryParamMap: convertToParamMap({}) } };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login: loginSpy } },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should start in Login mode', () => {
    expect(compiled.textContent).toContain('Login');
    expect(compiled.textContent).not.toContain('Registro');

    const toggleButton = compiled.querySelector('button');
    expect(toggleButton).toBeTruthy();
    expect(toggleButton?.textContent).toContain('Criar conta');
  });

  it('should render a create account navigation button', () => {
    const toggleButton = compiled.querySelector('button');

    expect(toggleButton).toBeTruthy();
    expect(toggleButton?.textContent).toContain('Criar conta');
  });

  it('should render an email input field in Login mode', () => {
    const emailInput = compiled.querySelector("input[type='email']");

    expect(emailInput).toBeTruthy();
  });

  it('should render a password input field in Login mode', () => {
    const passwordInput = compiled.querySelector("input[type='password']");

    expect(passwordInput).toBeTruthy();
  });

  it('should have a label associated with the email input', () => {
    const label = compiled.querySelector("label[for='login-email']");
    const input = compiled.querySelector("input#login-email");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it('should have a label associated with the password input', () => {
    const label = compiled.querySelector("label[for='login-password']");
    const input = compiled.querySelector("input#login-password");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it('should render an Entrar submit button in Login mode', () => {
    const submitButton = compiled.querySelector("button[type='submit']");

    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toContain('Entrar');
  });

  it('should disable login button when email field is empty', () => {
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable login button when password field is empty', () => {
    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable login button when email and password fields are empty', () => {
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.loginForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should call AuthService.login with lowercased email', () => {
    component.loginForm.controls.email.setValue('USER@Mail.COM');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'Valid@123',
    });
  });

  it('should call AuthService.login with form payload on valid submit', () => {
    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'Valid@123',
    });
  });

  it('should navigate to /dashboard on successful login', () => {
    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call AuthService.login when form is invalid', () => {
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    fixture.detectChanges();

    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('should display an error message when login fails', () => {
    loginSpy.mockImplementationOnce(() => throwError(() => new Error('401')));

    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    const errorElement = compiled.querySelector("[data-testid='login-error']");

    expect(component.errorMessage()).toBeTruthy();
    expect(errorElement).toBeTruthy();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should display a specific message when login fails with 401', () => {
    const error = new HttpErrorResponse({ status: 401 });
    loginSpy.mockImplementationOnce(() => throwError(() => error));

    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('WrongPass@1');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    const errorElement = compiled.querySelector("[data-testid='login-error']");
    expect(errorElement?.textContent?.trim()).toBe('Credenciais inválidas. Verifique seu email e senha.');
  });

  describe('returnUrl handling', () => {
    it('should navigate to a valid returnUrl after successful login', () => {
      activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/divisions' });

      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('user@mail.com');
      component.loginForm.controls.password.setValue('Valid@123');
      fixture.detectChanges();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/divisions']);
    });

    it('should fall back to /dashboard when returnUrl is absent', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('user@mail.com');
      component.loginForm.controls.password.setValue('Valid@123');
      fixture.detectChanges();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should fall back to /dashboard when returnUrl is an external http:// URL', () => {
      activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: 'http://evil.com/steal' });

      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('user@mail.com');
      component.loginForm.controls.password.setValue('Valid@123');
      fixture.detectChanges();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should fall back to /dashboard when returnUrl starts with //', () => {
      activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: '//evil.com' });

      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('user@mail.com');
      component.loginForm.controls.password.setValue('Valid@123');
      fixture.detectChanges();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('aria accessibility', () => {
    it('should set aria-invalid="true" on email input when invalid and touched', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('');
      component.loginForm.controls.email.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector("input#login-email");
      expect(emailInput?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on email input when valid and touched', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.email.setValue('user@mail.com');
      component.loginForm.controls.email.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector("input#login-email");
      expect(emailInput?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to email error on email input', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector("input#login-email");
      expect(emailInput?.getAttribute('aria-describedby')).toBe('login-email-error');
    });

    it('should set aria-invalid="true" on password input when invalid and touched', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.password.setValue('');
      component.loginForm.controls.password.markAsTouched();
      fixture.detectChanges();

      const passwordInput = fixture.nativeElement.querySelector("input#login-password");
      expect(passwordInput?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on password input when valid and touched', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      component.loginForm.controls.password.setValue('Valid@123');
      component.loginForm.controls.password.markAsTouched();
      fixture.detectChanges();

      const passwordInput = fixture.nativeElement.querySelector("input#login-password");
      expect(passwordInput?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to password error on password input', () => {
      const fixture = TestBed.createComponent(LoginComponent);
      fixture.detectChanges();

      const passwordInput = fixture.nativeElement.querySelector("input#login-password");
      expect(passwordInput?.getAttribute('aria-describedby')).toBe('login-password-error');
    });
  });

  it('should have autocomplete="email" on the email input', () => {
    const emailInput = compiled.querySelector("input[type='email']");
    expect(emailInput?.getAttribute('autocomplete')).toBe('email');
  });

  it('should have autocomplete="current-password" on the password input', () => {
    const passwordInput = compiled.querySelector("input[type='password']");
    expect(passwordInput?.getAttribute('autocomplete')).toBe('current-password');
  });

  it('should disable submit button while request is in flight', () => {
    const subject = new Subject<{ results: unknown }>();
    loginSpy.mockReturnValueOnce(subject.asObservable());

    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    subject.complete();
  });

  it('should show loading text in submit button while request is in flight', () => {
    const subject = new Subject<{ results: unknown }>();
    loginSpy.mockReturnValueOnce(subject.asObservable());

    component.loginForm.controls.email.setValue('user@mail.com');
    component.loginForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;
    expect(submitButton.textContent?.trim()).toBe('Entrando...');

    subject.complete();
  });
});
