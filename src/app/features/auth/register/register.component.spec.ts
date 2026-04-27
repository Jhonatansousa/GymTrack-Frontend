import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { MockInstance, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

type RegisterControlKey = keyof RegisterComponent['registerForm']['controls'];

describe('RegisterComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<RegisterComponent>>;
  let component: RegisterComponent;
  let compiled: HTMLElement;
  let registerSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: MockInstance<Router['navigate']>;

  beforeEach(() => {
    registerSpy = vi.fn(() => of({ results: {} }));

    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { register: registerSpy } },
      ],
    });

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function control<K extends RegisterControlKey>(
    key: K
  ): RegisterComponent['registerForm']['controls'][K] {
    return component.registerForm.controls[key];
  }

  function setControlValue<K extends RegisterControlKey>(
    key: K,
    value: string,
    touched = true
  ): void {
    const formControl = control(key) as FormControl<string>;
    formControl.setValue(value);

    if (touched) {
      formControl.markAsTouched();
    }

    fixture.detectChanges();
  }

  function fillForm(values: Partial<Record<RegisterControlKey, string>> = {}): void {
    const merged = { name: 'User Name', email: 'user@mail.com', password: 'Valid@123', ...values };
    component.registerForm.controls.name.setValue(merged.name);
    component.registerForm.controls.email.setValue(merged.email);
    component.registerForm.controls.password.setValue(merged.password);
    fixture.detectChanges();
  }

  function inputByName(name: RegisterControlKey): HTMLInputElement | null {
    return compiled.querySelector(`input[formControlName='${name}']`);
  }

  function inputById(name: RegisterControlKey): HTMLInputElement | null {
    return compiled.querySelector(`input#register-${name}`);
  }

  function submitButton(): HTMLButtonElement {
    return compiled.querySelector("button[type='submit']") as HTMLButtonElement;
  }

  function backButton(): HTMLButtonElement | null {
    return compiled.querySelector("button[type='button']");
  }

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function mockRegisterError(error: unknown): void {
    registerSpy.mockImplementationOnce(() => throwError(() => error));
  }

  function mockRegisterInFlight(): Subject<{ results: unknown }> {
    const subject = new Subject<{ results: unknown }>();
    registerSpy.mockReturnValueOnce(subject.asObservable());
    return subject;
  }

  describe('form structure', () => {
    it('should create a form with name, email and password controls', () => {
      expect(component.registerForm).toBeTruthy();
      expect(component.registerForm.contains('name')).toBeTruthy();
      expect(component.registerForm.contains('email')).toBeTruthy();
      expect(component.registerForm.contains('password')).toBeTruthy();
    });

    it('should render name, email and password inputs with correct types', () => {
      expect(inputByName('name')).toBeTruthy();
      expect(inputByName('email')).toBeTruthy();
      expect(inputByName('password')).toBeTruthy();
      expect(inputByName('name')?.getAttribute('type')).toBe('text');
      expect(inputByName('email')?.getAttribute('type')).toBe('email');
      expect(inputByName('password')?.getAttribute('type')).toBe('password');
    });

    it('should have a label associated with the name input', () => {
      expect(compiled.querySelector("label[for='register-name']")).toBeTruthy();
      expect(inputById('name')).toBeTruthy();
    });

    it('should have a label associated with the email input', () => {
      expect(compiled.querySelector("label[for='register-email']")).toBeTruthy();
      expect(inputById('email')).toBeTruthy();
    });

    it('should have a label associated with the password input', () => {
      expect(compiled.querySelector("label[for='register-password']")).toBeTruthy();
      expect(inputById('password')).toBeTruthy();
    });

    it('should render a Registrar submit button and a Já tem uma conta? back button', () => {
      expect(submitButton()).toBeTruthy();
      expect(submitButton().textContent).toContain('Registrar');
      expect(backButton()).toBeTruthy();
      expect(backButton()?.textContent).toContain('Já tem uma conta?');
    });
  });

  describe('aria accessibility', () => {
    it('should set aria-invalid="true" on name input when invalid and touched', () => {
      setControlValue('name', '');
      expect(inputById('name')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on name input when valid and touched', () => {
      setControlValue('name', 'John');
      expect(inputById('name')?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to name error container on name input', () => {
      expect(inputById('name')?.getAttribute('aria-describedby')).toBe('register-name-errors');
    });

    it('should set aria-invalid="true" on email input when invalid and touched', () => {
      setControlValue('email', '');
      expect(inputById('email')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on email input when valid and touched', () => {
      setControlValue('email', 'user@mail.com');
      expect(inputById('email')?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to email error container on email input', () => {
      expect(inputById('email')?.getAttribute('aria-describedby')).toBe('register-email-errors');
    });

    it('should set aria-invalid="true" on password input when invalid and touched', () => {
      setControlValue('password', '');
      expect(inputById('password')?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid on password input when valid and touched', () => {
      setControlValue('password', 'Valid@123');
      expect(inputById('password')?.getAttribute('aria-invalid')).toBeNull();
    });

    it('should have aria-describedby pointing to password error container on password input', () => {
      expect(inputById('password')?.getAttribute('aria-describedby')).toBe('register-password-errors');
    });
  });

  describe('submit button state', () => {
    it('should disable submit button when name is empty', () => {
      fillForm({ name: '' });

      expect(component.registerForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should disable submit button when email is empty', () => {
      fillForm({ email: '' });

      expect(component.registerForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should disable submit button when password is empty', () => {
      fillForm({ password: '' });

      expect(component.registerForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });

    it('should enable submit button when all fields are filled', () => {
      fillForm();

      expect(component.registerForm.valid).toBeTruthy();
      expect(submitButton().disabled).toBe(false);
    });

    it('should disable submit button while request is in flight', () => {
      const subject = mockRegisterInFlight();

      fillForm();
      component.onSubmit();
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);

      subject.complete();
    });

    it('should show loading text in submit button while request is in flight', () => {
      const subject = mockRegisterInFlight();

      fillForm();
      component.onSubmit();
      fixture.detectChanges();

      expect(submitButton().textContent?.trim()).toBe('Registrando...');

      subject.complete();
    });

    it('should re-enable submit button after request fails', () => {
      mockRegisterError(new Error('500'));
      fillForm();

      component.onSubmit();
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(false);
    });

    it('should disable submit button when email format is invalid', () => {
      fillForm({ email: 'notanemail' });

      expect(component.registerForm.invalid).toBeTruthy();
      expect(submitButton().disabled).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to login page when clicking the back button', () => {
      const back = backButton();
      expect(back).toBeTruthy();

      back?.dispatchEvent(new MouseEvent('click'));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
    });
  });

  describe('validation errors (touched)', () => {
    it('should display an error message when the name field is empty and touched', () => {
      setControlValue('name', '');

      expect(control('name').hasError('required')).toBeTruthy();
      expect(queryByTestId('name-error-required')).toBeTruthy();
    });

    it('should display an error message when the email field is empty and touched', () => {
      setControlValue('email', '');

      expect(control('email').hasError('required')).toBeTruthy();
      expect(queryByTestId('email-error-required')).toBeTruthy();
    });

    it('should display an error message when the password field is empty and touched', () => {
      setControlValue('password', '');

      expect(control('password').hasError('required')).toBeTruthy();
      expect(queryByTestId('password-error-required')).toBeTruthy();
    });

    it('should display an error message when the email field has an invalid format and is touched', () => {
      setControlValue('email', 'invalid-email');

      expect(control('email').hasError('email')).toBeTruthy();
      expect(queryByTestId('email-error-format')).toBeTruthy();
    });

    it('should display an error message when the password is shorter than 8 characters and touched', () => {
      setControlValue('password', 'Ab1@x');

      expect(control('password').hasError('minlength')).toBeTruthy();
      expect(queryByTestId('password-error-minlength')).toBeTruthy();
    });

    it('should display an uppercase error message when the password has no uppercase letter and is touched', () => {
      setControlValue('password', 'valid@123');

      expect(control('password').hasError('pattern')).toBeTruthy();
      expect(queryByTestId('password-error-uppercase')).toBeTruthy();
    });

    it('should display a lowercase error message when the password has no lowercase letter and is touched', () => {
      setControlValue('password', 'VALID@123');

      expect(control('password').hasError('pattern')).toBeTruthy();
      expect(queryByTestId('password-error-lowercase')).toBeTruthy();
    });

    it('should display a number error message when the password has no number and is touched', () => {
      setControlValue('password', 'Valid@Password');

      expect(control('password').hasError('pattern')).toBeTruthy();
      expect(queryByTestId('password-error-number')).toBeTruthy();
    });

    it('should display a specialChar error message when the password has no special character and is touched', () => {
      setControlValue('password', 'Valid1234');

      expect(control('password').hasError('pattern')).toBeTruthy();
      expect(queryByTestId('password-error-specialChar')).toBeTruthy();
    });

    it('should display an error message when the name is shorter than 2 characters and is touched', () => {
      setControlValue('name', 'A');

      expect(control('name').hasError('minlength')).toBeTruthy();
      expect(queryByTestId('name-error-minlength')).toBeTruthy();
    });

    it('should NOT display a name minlength error when name has 2 or more characters', () => {
      setControlValue('name', 'Al');

      expect(control('name').hasError('minlength')).toBeFalsy();
      expect(queryByTestId('name-error-minlength')).toBeNull();
    });

    it('should display an error message when the name exceeds 100 characters and is touched', () => {
      setControlValue('name', 'a'.repeat(101));

      expect(control('name').hasError('maxlength')).toBeTruthy();
      expect(queryByTestId('name-error-maxlength')).toBeTruthy();
    });

    it('should display an error message when the email exceeds 254 characters and is touched', () => {
      setControlValue('email', `${'a'.repeat(250)}@a.com`);

      expect(control('email').hasError('maxlength')).toBeTruthy();
      expect(queryByTestId('email-error-maxlength')).toBeTruthy();
    });

    it('should display an error message when the password exceeds 128 characters and is touched', () => {
      setControlValue('password', 'a'.repeat(129));

      expect(control('password').hasError('maxlength')).toBeTruthy();
      expect(queryByTestId('password-error-maxlength')).toBeTruthy();
    });
  });

  describe('error suppression (untouched / valid)', () => {
    it('should NOT display a name required error when name is invalid but untouched', () => {
      setControlValue('name', '', false);

      expect(control('name').invalid).toBeTruthy();
      expect(control('name').touched).toBe(false);
      expect(queryByTestId('name-error-required')).toBeNull();
    });

    it('should NOT display an email format error when email is invalid but untouched', () => {
      setControlValue('email', 'invalid-email', false);

      expect(control('email').invalid).toBeTruthy();
      expect(control('email').touched).toBe(false);
      expect(queryByTestId('email-error-format')).toBeNull();
    });

    it('should NOT display a password minlength error when password is invalid but untouched', () => {
      setControlValue('password', 'abc', false);

      expect(control('password').invalid).toBeTruthy();
      expect(control('password').touched).toBe(false);
      expect(queryByTestId('password-error-minlength')).toBeNull();
    });

    it('should NOT display a name required error when name is valid and touched', () => {
      setControlValue('name', 'John Doe');

      expect(control('name').valid).toBeTruthy();
      expect(queryByTestId('name-error-required')).toBeNull();
    });

    it('should NOT display an email format error when email is valid and touched', () => {
      setControlValue('email', 'user@mail.com');

      expect(control('email').valid).toBeTruthy();
      expect(queryByTestId('email-error-format')).toBeNull();
    });

    it('should NOT display a password rule error when password is valid and touched', () => {
      setControlValue('password', 'Valid@123');

      expect(control('password').valid).toBeTruthy();
      expect(queryByTestId('password-error-minlength')).toBeNull();
      expect(queryByTestId('password-error-uppercase')).toBeNull();
      expect(queryByTestId('password-error-lowercase')).toBeNull();
      expect(queryByTestId('password-error-number')).toBeNull();
      expect(queryByTestId('password-error-specialChar')).toBeNull();
    });
  });

  describe('form submission', () => {
    const expectedPayload = {
      name: 'User Name',
      email: 'user@mail.com',
      password: 'Valid@123',
    };

    it('should call AuthService.register with lowercased email', () => {
      fillForm({ email: 'USER@Mail.COM' });

      component.onSubmit();

      expect(registerSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('should call AuthService.register with form payload on valid submit', () => {
      fillForm();

      component.onSubmit();

      expect(registerSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('should navigate to /dashboard on successful registration', () => {
      fillForm();

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not call AuthService.register when form is invalid', () => {
      fillForm({ name: '', email: '', password: '' });

      component.onSubmit();

      expect(registerSpy).not.toHaveBeenCalled();
    });

    it('should display an error message when registration fails', () => {
      mockRegisterError(new Error('409'));
      fillForm();

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage()).toBeTruthy();
      expect(queryByTestId('register-error')).toBeTruthy();
    });

    it('should display a specific message when registration fails with 409', () => {
      mockRegisterError(new HttpErrorResponse({ status: 409 }));
      fillForm();

      component.onSubmit();
      fixture.detectChanges();

      expect(queryByTestId('register-error')?.textContent?.trim()).toBe('Este email já está cadastrado.');
    });
  });

  describe('error handling', () => {
    it('should clear error message when a new submit is attempted', () => {
      mockRegisterError(new Error('401'));
      fillForm();
      component.onSubmit();
      fixture.detectChanges();
      expect(queryByTestId('register-error')).toBeTruthy();

      const subject = mockRegisterInFlight();
      fillForm();

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage()).toBeFalsy();
      expect(queryByTestId('register-error')).toBeNull();

      subject.complete();
    });
  });

  describe('autocomplete', () => {
    it('should have autocomplete="email" on the email input', () => {
      expect(inputByName('email')?.getAttribute('autocomplete')).toBe('email');
    });

    it('should have autocomplete="new-password" on the password input', () => {
      expect(inputByName('password')?.getAttribute('autocomplete')).toBe('new-password');
    });
  });
});
