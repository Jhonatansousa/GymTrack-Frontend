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
      <h1 class="text-xl font-semibold">Registrar</h1>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
        <label for="register-name" class="text-sm font-medium">Nome</label>
        <input
          id="register-name"
          type="text"
          formControlName="name"
          aria-describedby="register-name-errors"
          [attr.aria-invalid]="registerForm.controls.name.invalid && registerForm.controls.name.touched ? 'true' : null"
          class="w-full rounded border px-3 py-2"
        />
        <div id="register-name-errors">
          @if (shouldShowError('name', 'required')) {
            <p data-testid="name-error-required" class="text-sm text-red-600">O campo Nome é obrigatório.</p>
          }
          @if (shouldShowError('name', 'minlength')) {
            <p data-testid="name-error-minlength" class="text-sm text-red-600">
              Nome deve ter pelo menos 2 caracteres.
            </p>
          }
          @if (shouldShowError('name', 'maxlength')) {
            <p data-testid="name-error-maxlength" class="text-sm text-red-600">
              Nome deve ter no máximo 100 caracteres.
            </p>
          }
        </div>

        <label for="register-email" class="text-sm font-medium">Email</label>
        <input
          id="register-email"
          type="email"
          formControlName="email"
          autocomplete="email"
          aria-describedby="register-email-errors"
          [attr.aria-invalid]="registerForm.controls.email.invalid && registerForm.controls.email.touched ? 'true' : null"
          class="w-full rounded border px-3 py-2"
        />
        <div id="register-email-errors">
          @if (shouldShowError('email', 'required')) {
            <p data-testid="email-error-required" class="text-sm text-red-600">O campo Email é obrigatório.</p>
          }
          @if (shouldShowError('email', 'email')) {
            <p data-testid="email-error-format" class="text-sm text-red-600">Formato de email inválido.</p>
          }
          @if (shouldShowError('email', 'maxlength')) {
            <p data-testid="email-error-maxlength" class="text-sm text-red-600">
              Email deve ter no máximo 254 caracteres.
            </p>
          }
        </div>

        <label for="register-password" class="text-sm font-medium">Senha</label>
        <input
          id="register-password"
          type="password"
          formControlName="password"
          autocomplete="new-password"
          aria-describedby="register-password-errors"
          [attr.aria-invalid]="registerForm.controls.password.invalid && registerForm.controls.password.touched ? 'true' : null"
          class="w-full rounded border px-3 py-2"
        />
        <div id="register-password-errors">
          @if (shouldShowError('password', 'required')) {
            <p data-testid="password-error-required" class="text-sm text-red-600">O campo Senha é obrigatório.</p>
          }
          @if (shouldShowError('password', 'minlength')) {
            <p data-testid="password-error-minlength" class="text-sm text-red-600">
              Senha deve ter pelo menos 8 caracteres.
            </p>
          }
          @if (shouldShowError('password', 'maxlength')) {
            <p data-testid="password-error-maxlength" class="text-sm text-red-600">
              Senha deve ter no máximo 128 caracteres.
            </p>
          }
          @if (shouldShowPasswordPatternRule('uppercase')) {
            <p data-testid="password-error-uppercase" class="text-sm text-red-600">
              Senha deve conter uma letra maiúscula.
            </p>
          }
          @if (shouldShowPasswordPatternRule('lowercase')) {
            <p data-testid="password-error-lowercase" class="text-sm text-red-600">
              Senha deve conter uma letra minúscula.
            </p>
          }
          @if (shouldShowPasswordPatternRule('number')) {
            <p data-testid="password-error-number" class="text-sm text-red-600">
              Senha deve conter um número.
            </p>
          }
          @if (shouldShowPasswordPatternRule('specialChar')) {
            <p data-testid="password-error-specialChar" class="text-sm text-red-600">
              Senha deve conter um caractere especial.
            </p>
          }
        </div>

        <button
          type="submit"
          [disabled]="registerForm.invalid || isSubmitting()"
          [class.opacity-50]="registerForm.invalid || isSubmitting()"
          [class.cursor-not-allowed]="registerForm.invalid || isSubmitting()"
          [class.bg-black]="registerForm.valid && !isSubmitting()"
          [class.text-white]="registerForm.valid && !isSubmitting()"
          class="w-full rounded border px-3 py-2 font-medium transition"
        >
          @if (isSubmitting()) { Registrando... } @else { Registrar }
        </button>

        <button type="button" (click)="goToLogin()" class="self-start text-sm underline">
          Já tem uma conta?
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

    const { name, email, password } = this.registerForm.getRawValue();
    this.authService.register({ name, email: email.trim().toLowerCase(), password }).subscribe({
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
