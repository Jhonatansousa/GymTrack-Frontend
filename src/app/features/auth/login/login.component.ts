import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { shouldShowError } from '../../../shared/utils/form-errors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-sm bg-surface border border-border rounded-md p-6 sm:p-8 flex flex-col gap-6">
        <h1 class="font-serif font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-text">
          Login
        </h1>

        <button
          type="button"
          [routerLink]="['/auth/register']"
          class="self-start font-sans text-sm text-text-muted hover:text-text transition-colors duration-150 underline-offset-4 hover:underline"
        >
          Criar conta
        </button>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              for="login-email"
              class="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              placeholder="Email"
              autocomplete="email"
              aria-describedby="login-email-error"
              [attr.aria-invalid]="loginForm.controls.email.invalid && loginForm.controls.email.touched ? 'true' : null"
              [class]="'w-full bg-surface-raised border rounded px-3 py-2.5 font-sans text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 transition-colors duration-150 ' + (loginForm.controls.email.invalid && loginForm.controls.email.touched ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-border-strong focus:ring-accent/30')"
            />
            <div id="login-email-error" class="flex flex-col gap-1">
              @if (shouldShowError(loginForm.controls.email, 'required')) {
                <p data-testid="email-error-required" class="font-mono text-[11px] text-error tracking-wide">
                  O campo precisa ser preenchido.
                </p>
              }
              @if (shouldShowError(loginForm.controls.email, 'email')) {
                <p data-testid="email-error-format" class="font-mono text-[11px] text-error tracking-wide">
                  Formato de email inválido.
                </p>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="login-password"
              class="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              placeholder="Senha"
              autocomplete="current-password"
              aria-describedby="login-password-error"
              [attr.aria-invalid]="loginForm.controls.password.invalid && loginForm.controls.password.touched ? 'true' : null"
              [class]="'w-full bg-surface-raised border rounded px-3 py-2.5 font-sans text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 transition-colors duration-150 ' + (shouldShowError(loginForm.controls.password, 'required') ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-border-strong focus:ring-accent/30')"
            />
            @if (shouldShowError(loginForm.controls.password, 'required')) {
              <p id="login-password-error" class="font-mono text-[11px] text-error tracking-wide">
                O campo precisa ser preenchido.
              </p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isSubmitting()"
            class="w-full bg-accent text-on-accent font-sans font-semibold text-sm px-4 py-2.5 rounded transition-all duration-150 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            @if (isSubmitting()) { Entrando... } @else { Entrar }
          </button>

          @if (errorMessage()) {
            <p data-testid="login-error" class="font-mono text-[11px] text-error tracking-wide">
              {{ errorMessage() }}
            </p>
          }
        </form>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(
    this.route.snapshot.queryParamMap.has('sessionCheckFailed')
      ? 'Não foi possível confirmar sua sessão. Tente novamente.'
      : null,
  );

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
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'O servidor demorou para responder. Tente novamente.';
    }
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return 'Credenciais inválidas. Verifique seu email e senha.';
    }
    return 'Falha ao autenticar. Verifique suas credenciais.';
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
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }
}
