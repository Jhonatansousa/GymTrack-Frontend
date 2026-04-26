import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { MockInstance, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

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

  function control<K extends keyof RegisterComponent['registerForm']['controls']>(
    key: K
  ): RegisterComponent['registerForm']['controls'][K] {
    return component.registerForm.controls[key];
  }

  function setControlValue<K extends keyof RegisterComponent['registerForm']['controls']>(
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

  function queryByTestId(testId: string): HTMLElement | null {
    return compiled.querySelector(`[data-testid='${testId}']`);
  }

  function fillValidForm(): void {
    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();
  }

  it('should create a form with name, email and password controls', () => {
    expect(component.registerForm).toBeTruthy();
    expect(component.registerForm.contains('name')).toBeTruthy();
    expect(component.registerForm.contains('email')).toBeTruthy();
    expect(component.registerForm.contains('password')).toBeTruthy();
  });

  it('should render name, email and password inputs with correct types', () => {
    const nameInput = compiled.querySelector("input[formControlName='name']");
    const emailInput = compiled.querySelector("input[formControlName='email']");
    const passwordInput = compiled.querySelector("input[formControlName='password']");

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(nameInput?.getAttribute('type')).toBe('text');
    expect(emailInput?.getAttribute('type')).toBe('email');
    expect(passwordInput?.getAttribute('type')).toBe('password');
  });

  it('should have a label associated with the name input', () => {
    const label = compiled.querySelector("label[for='register-name']");
    const input = compiled.querySelector("input#register-name");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it('should have a label associated with the email input', () => {
    const label = compiled.querySelector("label[for='register-email']");
    const input = compiled.querySelector("input#register-email");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it('should have a label associated with the password input', () => {
    const label = compiled.querySelector("label[for='register-password']");
    const input = compiled.querySelector("input#register-password");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it('should render a submit button labeled Register and a back button labeled Already a user?', () => {
    const submitButton = compiled.querySelector("button[type='submit']");
    const backButton = compiled.querySelector("button[type='button']");

    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toContain('Register');
    expect(backButton).toBeTruthy();
    expect(backButton?.textContent).toContain('Already a user?');
  });

  it('should disable submit button when name is empty', () => {
    component.registerForm.controls.name.setValue('');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable submit button when email is empty', () => {
    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable submit button when password is empty', () => {
    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('');
    fixture.detectChanges();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when all fields are filled', () => {
    fillValidForm();

    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.valid).toBeTruthy();
    expect(submitButton.disabled).toBe(false);
  });

  it('should navigate to login page when clicking the back button', () => {
    const backButton = compiled.querySelector("button[type='button']");

    expect(backButton).toBeTruthy();

    backButton?.dispatchEvent(new MouseEvent('click'));

    expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
  });

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

  it('should call AuthService.register with lowercased email', () => {
    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('USER@Mail.COM');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    component.onSubmit();

    expect(registerSpy).toHaveBeenCalledWith({
      name: 'User Name',
      email: 'user@mail.com',
      password: 'Valid@123',
    });
  });

  it('should call AuthService.register with form payload on valid submit', () => {
    fillValidForm();

    component.onSubmit();

    expect(registerSpy).toHaveBeenCalledWith({
      name: 'User Name',
      email: 'user@mail.com',
      password: 'Valid@123',
    });
  });

  it('should navigate to /dashboard on successful registration', () => {
    fillValidForm();

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call AuthService.register when form is invalid', () => {
    component.registerForm.controls.name.setValue('');
    component.registerForm.controls.email.setValue('');
    component.registerForm.controls.password.setValue('');
    fixture.detectChanges();

    component.onSubmit();

    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should display an error message when registration fails', () => {
    registerSpy.mockImplementationOnce(() => throwError(() => new Error('409')));
    fillValidForm();

    component.onSubmit();
    fixture.detectChanges();

    const errorElement = queryByTestId('register-error');

    expect(component.errorMessage()).toBeTruthy();
    expect(errorElement).toBeTruthy();
  });

  it('should display a specific message when registration fails with 409', () => {
    const error = new HttpErrorResponse({ status: 409 });
    registerSpy.mockImplementationOnce(() => throwError(() => error));

    fillValidForm();
    component.onSubmit();
    fixture.detectChanges();

    const errorElement = queryByTestId('register-error');
    expect(errorElement?.textContent?.trim()).toBe('Este email já está cadastrado.');
  });

  it('should have autocomplete="email" on the email input', () => {
    const emailInput = compiled.querySelector("input[formControlName='email']");
    expect(emailInput?.getAttribute('autocomplete')).toBe('email');
  });

  it('should have autocomplete="new-password" on the password input', () => {
    const passwordInput = compiled.querySelector("input[formControlName='password']");
    expect(passwordInput?.getAttribute('autocomplete')).toBe('new-password');
  });

  it('should disable submit button while request is in flight', () => {
    const subject = new Subject<{ results: unknown }>();
    registerSpy.mockReturnValueOnce(subject.asObservable());

    fillValidForm();
    component.onSubmit();
    fixture.detectChanges();

    const submitButton = compiled.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    subject.complete();
  });

  it('should show loading text in submit button while request is in flight', () => {
    const subject = new Subject<{ results: unknown }>();
    registerSpy.mockReturnValueOnce(subject.asObservable());

    fillValidForm();
    component.onSubmit();
    fixture.detectChanges();

    const submitButton = compiled.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    expect(submitButton.textContent?.trim()).toBe('Registrando...');

    subject.complete();
  });
});
