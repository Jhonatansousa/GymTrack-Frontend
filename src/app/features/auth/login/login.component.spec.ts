import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { MockInstance, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

type LoginControlKey = keyof LoginComponent['loginForm']['controls'];

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

  function setControlValue<K extends LoginControlKey>(key: K, value: string, touched = true): void {
    const formControl = component.loginForm.controls[key] as FormControl<string>;
    formControl.setValue(value);
    if (touched) formControl.markAsTouched();
    fixture.detectChanges();
  }

  function fillForm(values: Partial<Record<LoginControlKey, string>> = {}): void {
    const merged = { email: 'user@mail.com', password: 'Valid@123', ...values };
    component.loginForm.controls.email.setValue(merged.email);
    component.loginForm.controls.password.setValue(merged.password);
    fixture.detectChanges();
  }

  function inputById(name: LoginControlKey): HTMLInputElement | null {
    return compiled.querySelector(`input#login-${name}`);
  }

  function submitButton(): HTMLButtonElement {
    return compiled.querySelector("button[type='submit']") as HTMLButtonElement;
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function mockLoginError(error: unknown): void {
    loginSpy.mockImplementationOnce(() => throwError(() => error));
  }

  function mockLoginInFlight(): Subject<{ results: unknown }> {
    const subject = new Subject<{ results: unknown }>();
    loginSpy.mockReturnValueOnce(subject.asObservable());
    return subject;
  }

  describe('form structure', () => {
    it('should start in Login mode', () => {
      expect(compiled.textContent).toContain('Login');
      expect(compiled.textContent).not.toContain('Registro');

      const toggleButton = compiled.querySelector('button');
      expect(toggleButton).toBeTruthy();
      expect(toggleButton?.textContent).toContain('Criar conta');
    });

    it('should render an email input field in Login mode', () => {
      expect(compiled.querySelector("input[type='email']")).toBeTruthy();
    });

    it('should render a password input field in Login mode', () => {
      expect(compiled.querySelector("input[type='password']")).toBeTruthy();
    });

    it('should have a label associated with the email input', () => {
      expect(compiled.querySelector("label[for='login-email']")).toBeTruthy();
      expect(inputById('email')).toBeTruthy();
    });

    it('should have a label associated with the password input', () => {
      expect(compiled.querySelector("label[for='login-password']")).toBeTruthy();
      expect(inputById('password')).toBeTruthy();
    });

    it('should render an Entrar submit button in Login mode', () => {
      expect(submitButton()).toBeTruthy();
      expect(submitButton().textContent).toContain('Entrar');
    });
  });

  describe('submit button state', () => {
    it('should disable login button when email field is empty', () => {
      fillForm({ email: '' });

      expect(component.loginForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should disable login button when password field is empty', () => {
      fillForm({ password: '' });

      expect(component.loginForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should disable login button when email and password fields are empty', () => {
      fillForm({ email: '', password: '' });

      expect(component.loginForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should disable submit button while request is in flight', () => {
      const subject = mockLoginInFlight();

      fillForm();
      component.onSubmit();
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);

      subject.complete();
    });

    it('should show loading text in submit button while request is in flight', () => {
      const subject = mockLoginInFlight();

      fillForm();
      component.onSubmit();
      fixture.detectChanges();

      expect(submitButton().textContent?.trim()).toBe('Entrando...');

      subject.complete();
    });
  });

  describe('form submission', () => {
    const expectedPayload = { email: 'user@mail.com', password: 'Valid@123' };

    it('should call AuthService.login with lowercased email', () => {
      fillForm({ email: 'USER@Mail.COM' });

      component.onSubmit();

      expect(loginSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('should call AuthService.login with form payload on valid submit', () => {
      fillForm();

      component.onSubmit();

      expect(loginSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('should navigate to /dashboard on successful login', () => {
      fillForm();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not call AuthService.login when form is invalid', () => {
      fillForm({ email: '', password: '' });

      component.onSubmit();

      expect(loginSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should display an error message when login fails', () => {
      mockLoginError(new Error('401'));
      fillForm();

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage()).toBeTruthy();
      expect(queryByTestId('login-error')).toBeTruthy();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should display a specific message when login fails with 401', () => {
      mockLoginError(new HttpErrorResponse({ status: 401 }));
      fillForm({ password: 'WrongPass@1' });

      component.onSubmit();
      fixture.detectChanges();

      expect(queryByTestId('login-error')?.textContent?.trim()).toBe('Credenciais inválidas. Verifique seu email e senha.');
    });
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
      setControlValue('email', '');
      expect(inputById('email')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on email input when valid and touched', () => {
      setControlValue('email', 'user@mail.com');
      expect(inputById('email')?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to email error on email input', () => {
      expect(inputById('email')?.getAttribute('aria-describedby')).toBe('login-email-error');
    });

    it('should set aria-invalid="true" on password input when invalid and touched', () => {
      setControlValue('password', '');
      expect(inputById('password')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on password input when valid and touched', () => {
      setControlValue('password', 'Valid@123');
      expect(inputById('password')?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to password error on password input', () => {
      expect(inputById('password')?.getAttribute('aria-describedby')).toBe('login-password-error');
    });
  });

  describe('autocomplete', () => {
    it('should have autocomplete="email" on the email input', () => {
      expect(compiled.querySelector("input[type='email']")?.getAttribute('autocomplete')).toBe('email');
    });

    it('should have autocomplete="current-password" on the password input', () => {
      expect(compiled.querySelector("input[type='password']")?.getAttribute('autocomplete')).toBe('current-password');
    });
  });
});
