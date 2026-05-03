import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { shouldShowError } from '../../../shared/utils/form-errors';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

type PasswordPatternRule = 'uppercase' | 'lowercase' | 'number' | 'specialChar';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-sm bg-surface border border-border rounded-md p-6 sm:p-8 flex flex-col gap-6">
        <h1 class="font-serif font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-text">
          Registrar
        </h1>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              for="register-name"
              class="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              Nome
            </label>
            <input
              id="register-name"
              type="text"
              formControlName="name"
              placeholder="Nome"
              aria-describedby="register-name-errors"
              [attr.aria-invalid]="registerForm.controls.name.invalid && registerForm.controls.name.touched ? 'true' : null"
              [class]="'w-full bg-surface-raised border rounded px-3 py-2.5 font-sans text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 transition-colors duration-150 ' + (registerForm.controls.name.invalid && registerForm.controls.name.touched ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-border-strong focus:ring-accent/30')"
            />
            <div id="register-name-errors" class="flex flex-col gap-1">
              @if (shouldShowError(registerForm.controls.name, 'required')) {
                <p data-testid="name-error-required" class="font-mono text-[11px] text-error tracking-wide">
                  O campo Nome é obrigatório.
                </p>
              }
              @if (shouldShowError(registerForm.controls.name, 'minlength')) {
                <p data-testid="name-error-minlength" class="font-mono text-[11px] text-error tracking-wide">
                  Nome deve ter pelo menos 2 caracteres.
                </p>
              }
              @if (shouldShowError(registerForm.controls.name, 'maxlength')) {
                <p data-testid="name-error-maxlength" class="font-mono text-[11px] text-error tracking-wide">
                  Nome deve ter no máximo 100 caracteres.
                </p>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="register-email"
              class="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              formControlName="email"
              placeholder="Email"
              autocomplete="email"
              aria-describedby="register-email-errors"
              [attr.aria-invalid]="registerForm.controls.email.invalid && registerForm.controls.email.touched ? 'true' : null"
              [class]="'w-full bg-surface-raised border rounded px-3 py-2.5 font-sans text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 transition-colors duration-150 ' + (registerForm.controls.email.invalid && registerForm.controls.email.touched ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-border-strong focus:ring-accent/30')"
            />
            <div id="register-email-errors" class="flex flex-col gap-1">
              @if (shouldShowError(registerForm.controls.email, 'required')) {
                <p data-testid="email-error-required" class="font-mono text-[11px] text-error tracking-wide">
                  O campo Email é obrigatório.
                </p>
              }
              @if (shouldShowError(registerForm.controls.email, 'email')) {
                <p data-testid="email-error-format" class="font-mono text-[11px] text-error tracking-wide">
                  Formato de email inválido.
                </p>
              }
              @if (shouldShowError(registerForm.controls.email, 'maxlength')) {
                <p data-testid="email-error-maxlength" class="font-mono text-[11px] text-error tracking-wide">
                  Email deve ter no máximo 254 caracteres.
                </p>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="register-password"
              class="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              Senha
            </label>
            <input
              id="register-password"
              type="password"
              formControlName="password"
              placeholder="Senha"
              autocomplete="new-password"
              aria-describedby="register-password-errors"
              [attr.aria-invalid]="registerForm.controls.password.invalid && registerForm.controls.password.touched ? 'true' : null"
              [class]="'w-full bg-surface-raised border rounded px-3 py-2.5 font-sans text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 transition-colors duration-150 ' + (registerForm.controls.password.invalid && registerForm.controls.password.touched ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-border-strong focus:ring-accent/30')"
            />
            <div id="register-password-errors" class="flex flex-col gap-1">
              @if (shouldShowError(registerForm.controls.password, 'required')) {
                <p data-testid="password-error-required" class="font-mono text-[11px] text-error tracking-wide">
                  O campo Senha é obrigatório.
                </p>
              }
              @if (shouldShowError(registerForm.controls.password, 'minlength')) {
                <p data-testid="password-error-minlength" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve ter pelo menos 8 caracteres.
                </p>
              }
              @if (shouldShowError(registerForm.controls.password, 'maxlength')) {
                <p data-testid="password-error-maxlength" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve ter no máximo 128 caracteres.
                </p>
              }
              @if (shouldShowPasswordPatternRule('uppercase')) {
                <p data-testid="password-error-uppercase" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve conter uma letra maiúscula.
                </p>
              }
              @if (shouldShowPasswordPatternRule('lowercase')) {
                <p data-testid="password-error-lowercase" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve conter uma letra minúscula.
                </p>
              }
              @if (shouldShowPasswordPatternRule('number')) {
                <p data-testid="password-error-number" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve conter um número.
                </p>
              }
              @if (shouldShowPasswordPatternRule('specialChar')) {
                <p data-testid="password-error-specialChar" class="font-mono text-[11px] text-error tracking-wide">
                  Senha deve conter um caractere especial.
                </p>
              }
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || isSubmitting()"
            class="w-full bg-accent text-on-accent font-sans font-semibold text-sm px-4 py-2.5 rounded transition-all duration-150 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            @if (isSubmitting()) { Registrando... } @else { Registrar }
          </button>

          <button
            type="button"
            [routerLink]="['/auth']"
            class="self-center font-sans text-sm text-text-muted hover:text-text transition-colors duration-150 underline-offset-4 hover:underline"
          >
            Já tem uma conta?
          </button>

          @if (errorMessage()) {
            <p data-testid="register-error" class="font-mono text-[11px] text-error tracking-wide">
              {{ errorMessage() }}
            </p>
          }
        </form>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly passwordRules: { key: PasswordPatternRule; test: (v: string) => boolean }[] = [
    { key: 'uppercase', test: (v) => /[A-Z]/.test(v) },
    { key: 'lowercase', test: (v) => /[a-z]/.test(v) },
    { key: 'number', test: (v) => /\d/.test(v) },
    { key: 'specialChar', test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

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

  protected readonly shouldShowError = shouldShowError;

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

  shouldShowPasswordPatternRule(rule: PasswordPatternRule): boolean {
    if (!shouldShowError(this.registerForm.controls.password, 'pattern')) return false;
    const found = this.passwordRules.find((r) => r.key === rule);
    return found ? !found.test(this.registerForm.controls.password.value) : false;
  }
}
