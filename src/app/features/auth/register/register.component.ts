import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type RegisterForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="registerForm">
      <input type="text" formControlName="name" />
      @if (registerForm.controls.name.invalid && registerForm.controls.name.touched) {
        @if (registerForm.controls.name.hasError('required')) {
          <p data-testid="name-error-required">Name is required.</p>
        }
        @if (registerForm.controls.name.hasError('maxlength')) {
          <p data-testid="name-error-maxlength">Name must have at most 100 characters.</p>
        }
      }

      <input type="email" formControlName="email" />
      @if (registerForm.controls.email.invalid && registerForm.controls.email.touched) {
        @if (registerForm.controls.email.hasError('required')) {
          <p data-testid="email-error-required">Email is required.</p>
        }
        @if (registerForm.controls.email.hasError('email')) {
          <p data-testid="email-error-format">Email format is invalid.</p>
        }
        @if (registerForm.controls.email.hasError('maxlength')) {
          <p data-testid="email-error-maxlength">Email must have at most 254 characters.</p>
        }
      }

      <input type="password" formControlName="password" />
      @if (registerForm.controls.password.invalid && registerForm.controls.password.touched) {
        @if (registerForm.controls.password.hasError('required')) {
          <p data-testid="password-error-required">Password is required.</p>
        }
        @if (registerForm.controls.password.hasError('minlength')) {
          <p data-testid="password-error-minlength">Password must have at least 8 characters.</p>
        }
        @if (registerForm.controls.password.hasError('maxlength')) {
          <p data-testid="password-error-maxlength">Password must have at most 128 characters.</p>
        }
        @if (registerForm.controls.password.hasError('pattern') && !hasUppercase(registerForm.controls.password.value)) {
          <p data-testid="password-error-uppercase">Password must contain an uppercase letter.</p>
        }
        @if (registerForm.controls.password.hasError('pattern') && !hasLowercase(registerForm.controls.password.value)) {
          <p data-testid="password-error-lowercase">Password must contain a lowercase letter.</p>
        }
        @if (registerForm.controls.password.hasError('pattern') && !hasNumber(registerForm.controls.password.value)) {
          <p data-testid="password-error-number">Password must contain a number.</p>
        }
        @if (registerForm.controls.password.hasError('pattern') && !hasSpecialChar(registerForm.controls.password.value)) {
          <p data-testid="password-error-specialChar">Password must contain a special character.</p>
        }
      }

      <button type="submit" [disabled]="registerForm.invalid">Register</button>
      <button type="button" (click)="goToLogin()">Already a user?</button>
    </form>
  `,
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly uppercaseRegex = /[A-Z]/;
  private readonly lowercaseRegex = /[a-z]/;
  private readonly numberRegex = /\d/;
  private readonly specialCharRegex = /[^A-Za-z0-9]/;

  readonly registerForm = new FormGroup<RegisterForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
      ],
    }),
  });

  goToLogin(): void {
    void this.router.navigate(['/auth']);
  }

  hasUppercase(value: string): boolean {
    return this.uppercaseRegex.test(value);
  }

  hasLowercase(value: string): boolean {
    return this.lowercaseRegex.test(value);
  }

  hasNumber(value: string): boolean {
    return this.numberRegex.test(value);
  }

  hasSpecialChar(value: string): boolean {
    return this.specialCharRegex.test(value);
  }
}
