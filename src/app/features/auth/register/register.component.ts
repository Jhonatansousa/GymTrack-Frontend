import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.hasError.set(false);

    const { name, email, password } = this.form.getRawValue();

    this.authService
      .register({ name: name!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          // O backend já faz login automático e retorna o token
          // O AuthService armazena o token, basta navegar
          this.router.navigate(['/divisions']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set(
            err?.error?.message ?? 'Erro ao criar conta. O e-mail pode já estar em uso.'
          );
        },
      });
  }
}
