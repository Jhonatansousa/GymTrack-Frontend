import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { shouldShowError } from '../../../shared/utils/form-errors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <h1 class="text-xl font-semibold">Login</h1>

      <button type="button" [routerLink]="['/auth/register']" class="self-start text-sm underline">
        Criar conta
      </button>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
        <label for="login-email" class="text-sm font-medium">Email</label>
        <input
          id="login-email"
          type="email"
          formControlName="email"
          placeholder="Email"
          autocomplete="email"
          aria-describedby="login-email-error"
          [attr.aria-invalid]="loginForm.controls.email.invalid && loginForm.controls.email.touched ? 'true' : null"
          class="w-full rounded border px-3 py-2"
        />
        @if (shouldShowError(loginForm.controls.email, 'required')) {
          <p id="login-email-error" class="text-sm text-error">O campo precisa ser preenchido.</p>
        }

        <label for="login-password" class="text-sm font-medium">Senha</label>
        <input
          id="login-password"
          type="password"
          formControlName="password"
          placeholder="Senha"
          autocomplete="current-password"
          aria-describedby="login-password-error"
          [attr.aria-invalid]="loginForm.controls.password.invalid && loginForm.controls.password.touched ? 'true' : null"
          class="w-full rounded border px-3 py-2"
        />
        @if (shouldShowError(loginForm.controls.password, 'required')) {
          <p id="login-password-error" class="text-sm text-error">O campo precisa ser preenchido.</p>
        }

        <button
          type="submit"
          [disabled]="loginForm.invalid || isSubmitting()"
          [class.opacity-50]="loginForm.invalid || isSubmitting()"
          [class.cursor-not-allowed]="loginForm.invalid || isSubmitting()"
          [class.bg-primary]="loginForm.valid && !isSubmitting()"
          [class.text-on-primary]="loginForm.valid && !isSubmitting()"
          class="w-full rounded border px-3 py-2 font-medium transition"
        >
          @if (isSubmitting()) { Entrando... } @else { Entrar }
        </button>

        @if (errorMessage()) {
          <p data-testid="login-error" class="text-sm text-error">{{ errorMessage() }}</p>
        }
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly shouldShowError = shouldShowError;

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private isSafeReturnUrl(url: string | null): boolean {
    if (!url) return false;
    return !url.startsWith('http') && !url.startsWith('//');
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login({ email: email.trim().toLowerCase(), password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = this.isSafeReturnUrl(returnUrl) ? returnUrl! : '/dashboard';
        void this.router.navigate([destination]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err instanceof HttpErrorResponse && err.status === 401
            ? 'Credenciais inválidas. Verifique seu email e senha.'
            : 'Falha ao autenticar. Verifique suas credenciais.',
        );
      },
    });
  }
}
