import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router, RouterLink, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
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

    it.each<{ field: RegisterControlKey }>([
      { field: 'name' },
      { field: 'email' },
      { field: 'password' },
    ])('should have a label associated with the $field input', ({ field }) => {
      expect(compiled.querySelector(`label[for='register-${field}']`)).toBeTruthy();
      expect(inputById(field)).toBeTruthy();
    });

    it('should render a Registrar submit button and a Já tem uma conta? back button', () => {
      expect(submitButton()).toBeTruthy();
      expect(submitButton().textContent).toContain('Registrar');
      expect(backButton()).toBeTruthy();
      expect(backButton()?.textContent).toContain('Já tem uma conta?');
    });
  });

  describe('aria accessibility', () => {
    it.each<{ field: RegisterControlKey; invalidValue: string; validValue: string; describedById: string }>([
      { field: 'name', invalidValue: '', validValue: 'John', describedById: 'register-name-errors' },
      { field: 'email', invalidValue: '', validValue: 'user@mail.com', describedById: 'register-email-errors' },
      { field: 'password', invalidValue: '', validValue: 'Valid@123', describedById: 'register-password-errors' },
    ])(
      'should have correct aria attributes on $field input',
      ({ field, invalidValue, validValue, describedById }) => {
        expect(inputById(field)?.getAttribute('aria-describedby')).toBe(describedById);

        setControlValue(field, invalidValue);
        expect(inputById(field)?.getAttribute('aria-invalid')).toBe('true');

        setControlValue(field, validValue);
        expect(inputById(field)?.getAttribute('aria-invalid')).toBeNull();
      }
    );
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
    it('should have a back button linking to the login page', () => {
      const backDe = fixture.debugElement.query(By.css("button[type='button']"));
      expect(backDe).toBeTruthy();
      const routerLinkDir = backDe.injector.get(RouterLink);
      expect(routerLinkDir.urlTree?.toString()).toBe('/auth');
    });
  });

  describe('validation errors (touched)', () => {
    it.each<{ field: RegisterControlKey; testId: string }>([
      { field: 'name', testId: 'name-error-required' },
      { field: 'email', testId: 'email-error-required' },
      { field: 'password', testId: 'password-error-required' },
    ])('should display required error for $field when empty and touched', ({ field, testId }) => {
      setControlValue(field, '');

      expect(control(field).hasError('required')).toBeTruthy();
      expect(queryByTestId(testId)).toBeTruthy();
    });

    it.each<{ field: RegisterControlKey; value: string; error: string; testId: string }>([
      { field: 'email', value: 'invalid-email', error: 'email', testId: 'email-error-format' },
      { field: 'password', value: 'Ab1@x', error: 'minlength', testId: 'password-error-minlength' },
      { field: 'name', value: 'A', error: 'minlength', testId: 'name-error-minlength' },
      { field: 'name', value: 'a'.repeat(101), error: 'maxlength', testId: 'name-error-maxlength' },
      { field: 'email', value: `${'a'.repeat(250)}@a.com`, error: 'maxlength', testId: 'email-error-maxlength' },
      { field: 'password', value: 'a'.repeat(129), error: 'maxlength', testId: 'password-error-maxlength' },
    ])('should display $error error on $field when value is set and touched', ({ field, value, error, testId }) => {
      setControlValue(field, value);

      expect(control(field).hasError(error)).toBeTruthy();
      expect(queryByTestId(testId)).toBeTruthy();
    });

    it.each<{ value: string; testId: string }>([
      { value: 'valid@123', testId: 'password-error-uppercase' },
      { value: 'VALID@123', testId: 'password-error-lowercase' },
      { value: 'Valid@Password', testId: 'password-error-number' },
      { value: 'Valid1234', testId: 'password-error-specialChar' },
    ])('should display pattern error for $testId when password is "$value" and touched', ({ value, testId }) => {
      setControlValue('password', value);

      expect(control('password').hasError('pattern')).toBeTruthy();
      expect(queryByTestId(testId)).toBeTruthy();
    });

    it('should NOT display a name minlength error when name has 2 or more characters', () => {
      setControlValue('name', 'Al');

      expect(control('name').hasError('minlength')).toBeFalsy();
      expect(queryByTestId('name-error-minlength')).toBeNull();
    });
  });

  describe('error suppression (untouched / valid)', () => {
    it.each<{ field: RegisterControlKey; value: string; testId: string }>([
      { field: 'name', value: '', testId: 'name-error-required' },
      { field: 'email', value: 'invalid-email', testId: 'email-error-format' },
      { field: 'password', value: 'abc', testId: 'password-error-minlength' },
    ])('should NOT display $field error when invalid but untouched', ({ field, value, testId }) => {
      setControlValue(field, value, false);

      expect(control(field).invalid).toBeTruthy();
      expect(control(field).touched).toBe(false);
      expect(queryByTestId(testId)).toBeNull();
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
