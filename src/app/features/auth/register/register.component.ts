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
      <input type="email" formControlName="email" />
      <input type="password" formControlName="password" />
      <button type="submit" [disabled]="registerForm.invalid">Register</button>
      <button type="button" (click)="goToLogin()">Already a user?</button>
    </form>
  `,
})
export class RegisterComponent {
  private readonly router = inject(Router);

  readonly registerForm = new FormGroup<RegisterForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  goToLogin(): void {
    void this.router.navigate(['/auth']);
  }
}
