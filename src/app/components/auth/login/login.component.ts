import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LoginRequest } from '../../../models/auth';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  router = inject(Router);

  loginData: LoginRequest = {
    email: '',
    password: '',
  };

  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);
  passwordVisible = signal(false);

  onLogin(ngForm: NgForm) {
    this.errorMessage.set(null);

    if (ngForm.form.invalid) {
      ngForm.control.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email, password } = this.loginData;

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Login failed. Please check your credentials and try again.');
        console.error('Login error:', error); // Log the actual error for debugging
      }
    });

  }
  togglePasswordVisibility() {
    this.passwordVisible.update((v) => !v);
  }

  onGuestLogin() {
    // тук или логин с guest данни, или navigation
    // пример:
    // this.auth.login({ email: 'guest@example.com', password: 'guest123' }).subscribe(...)
    console.log('Guest login clicked');
  }
}
