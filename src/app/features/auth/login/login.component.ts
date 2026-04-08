import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoginMode()) {
      <section class="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
        <h1 class="text-xl font-semibold">Login</h1>

        <button type="button" (click)="showRegister()" class="self-start text-sm underline">
          Criar conta
        </button>

        <form [formGroup]="loginForm" class="flex flex-col gap-3">
          <input
            type="email"
            formControlName="email"
            placeholder="Email"
            class="w-full rounded border px-3 py-2"
          />

          <input
            type="password"
            formControlName="password"
            placeholder="Senha"
            class="w-full rounded border px-3 py-2"
          />

          <button type="submit" [disabled]="loginForm.invalid" class="w-full rounded border px-3 py-2 font-medium">Entrar</button>
        </form>
      </section>
    } @else {
      <section>Registro</section>
    }
  `,
})
export class LoginComponent {
  readonly isLoginMode = signal(true);
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

  showRegister(): void {
    this.isLoginMode.set(false);
  }
}
