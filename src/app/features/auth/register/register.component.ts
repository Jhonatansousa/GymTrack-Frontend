import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

type RegisterControlName = keyof RegisterForm;
type PasswordPatternRule = 'uppercase' | 'lowercase' | 'number' | 'specialChar';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <h1 class="text-xl font-semibold">Register</h1>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
        <input type="text" formControlName="name" class="w-full rounded border px-3 py-2" />
        @if (shouldShowError('name', 'required')) {
          <p data-testid="name-error-required" class="text-sm text-red-600">Name is required.</p>
        }
        @if (shouldShowError('name', 'minlength')) {
          <p data-testid="name-error-minlength" class="text-sm text-red-600">
            Name must have at least 2 characters.
          </p>
        }
        @if (shouldShowError('name', 'maxlength')) {
          <p data-testid="name-error-maxlength" class="text-sm text-red-600">
            Name must have at most 100 characters.
          </p>
        }

        <input type="email" formControlName="email" autocomplete="email" class="w-full rounded border px-3 py-2" />
        @if (shouldShowError('email', 'required')) {
          <p data-testid="email-error-required" class="text-sm text-red-600">Email is required.</p>
        }
        @if (shouldShowError('email', 'email')) {
          <p data-testid="email-error-format" class="text-sm text-red-600">Email format is invalid.</p>
        }
        @if (shouldShowError('email', 'maxlength')) {
          <p data-testid="email-error-maxlength" class="text-sm text-red-600">
            Email must have at most 254 characters.
          </p>
        }

        <input type="password" formControlName="password" autocomplete="new-password" class="w-full rounded border px-3 py-2" />
        @if (shouldShowError('password', 'required')) {
          <p data-testid="password-error-required" class="text-sm text-red-600">Password is required.</p>
        }
        @if (shouldShowError('password', 'minlength')) {
          <p data-testid="password-error-minlength" class="text-sm text-red-600">
            Password must have at least 8 characters.
          </p>
        }
        @if (shouldShowError('password', 'maxlength')) {
          <p data-testid="password-error-maxlength" class="text-sm text-red-600">
            Password must have at most 128 characters.
          </p>
        }
        @if (shouldShowPasswordPatternRule('uppercase')) {
          <p data-testid="password-error-uppercase" class="text-sm text-red-600">
            Password must contain an uppercase letter.
          </p>
        }
        @if (shouldShowPasswordPatternRule('lowercase')) {
          <p data-testid="password-error-lowercase" class="text-sm text-red-600">
            Password must contain a lowercase letter.
          </p>
        }
        @if (shouldShowPasswordPatternRule('number')) {
          <p data-testid="password-error-number" class="text-sm text-red-600">
            Password must contain a number.
          </p>
        }
        @if (shouldShowPasswordPatternRule('specialChar')) {
          <p data-testid="password-error-specialChar" class="text-sm text-red-600">
            Password must contain a special character.
          </p>
        }

        <button
          type="submit"
          [disabled]="registerForm.invalid || isSubmitting()"
          [class.opacity-50]="registerForm.invalid || isSubmitting()"
          [class.cursor-not-allowed]="registerForm.invalid || isSubmitting()"
          [class.bg-black]="registerForm.valid && !isSubmitting()"
          [class.text-white]="registerForm.valid && !isSubmitting()"
          class="w-full rounded border px-3 py-2 font-medium transition"
        >
          @if (isSubmitting()) { Registrando... } @else { Register }
        </button>

        <button type="button" (click)="goToLogin()" class="self-start text-sm underline">
          Already a user?
        </button>

        @if (errorMessage()) {
          <p data-testid="register-error" class="text-sm text-red-600">{{ errorMessage() }}</p>
        }
      </form>
    </section>
  `,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly uppercaseRegex = /[A-Z]/;
  private readonly lowercaseRegex = /[a-z]/;
  private readonly numberRegex = /\d/;
  private readonly specialCharRegex = /[^A-Za-z0-9]/;

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly registerForm = new FormGroup<RegisterForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
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

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err instanceof HttpErrorResponse && err.status === 409
            ? 'Este email já está cadastrado.'
            : 'Falha ao registrar. Tente novamente.',
        );
      },
    });
  }

  shouldShowError(controlName: RegisterControlName, errorKey: string): boolean {
    const formControl = this.registerForm.controls[controlName];
    return formControl.touched && formControl.hasError(errorKey);
  }

  shouldShowPasswordPatternRule(rule: PasswordPatternRule): boolean {
    const passwordValue = this.registerForm.controls.password.value;

    if (!this.shouldShowError('password', 'pattern')) {
      return false;
    }

    if (rule === 'uppercase') {
      return !this.hasUppercase(passwordValue);
    }

    if (rule === 'lowercase') {
      return !this.hasLowercase(passwordValue);
    }

    if (rule === 'number') {
      return !this.hasNumber(passwordValue);
    }

    return !this.hasSpecialChar(passwordValue);
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
