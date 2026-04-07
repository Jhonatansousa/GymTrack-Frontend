import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-auth-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoginMode()) {
      <section>Login</section>
      <button type="button" (click)="showRegister()">Criar conta</button>
    } @else {
      <section>Registro</section>
    }
  `,
})
export class AuthPageComponent {
  readonly isLoginMode = signal(true);

  showRegister(): void {
    this.isLoginMode.set(false);
  }
}
