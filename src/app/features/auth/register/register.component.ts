import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
      <button type="submit">Register</button>
    </form>
  `,
})
export class RegisterComponent {
  readonly registerForm = new FormGroup<RegisterForm>({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
}
