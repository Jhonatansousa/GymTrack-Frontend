import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

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
        <input
          type="email"
          formControlName="email"
          placeholder="Email"
          class="w-full rounded border px-3 py-2"
        />
        @if (loginForm.controls.email.hasError('required') && loginForm.controls.email.touched) {
          <p class="text-sm text-red-600">O campo precisa ser preenchido.</p>
        }

        <input
          type="password"
          formControlName="password"
          placeholder="Senha"
          class="w-full rounded border px-3 py-2"
        />
        @if (loginForm.controls.password.hasError('required') && loginForm.controls.password.touched) {
          <p class="text-sm text-red-600">O campo precisa ser preenchido.</p>
        }

        <button
          type="submit"
          [disabled]="loginForm.invalid || isSubmitting()"
          [class.opacity-50]="loginForm.invalid || isSubmitting()"
          [class.cursor-not-allowed]="loginForm.invalid || isSubmitting()"
          [class.bg-black]="loginForm.valid && !isSubmitting()"
          [class.text-white]="loginForm.valid && !isSubmitting()"
          class="w-full rounded border px-3 py-2 font-medium transition"
        >
          @if (isSubmitting()) { Entrando... } @else { Entrar }
        </button>

        @if (errorMessage()) {
          <p data-testid="login-error" class="text-sm text-red-600">{{ errorMessage() }}</p>
        }
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

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

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
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
