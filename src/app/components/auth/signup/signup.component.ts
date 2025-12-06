import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { RegisterRequest, RegisterResponse, SignupFormData } from '../../../models/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private auth = inject(AuthService);
  router = inject(Router);

  signupData: SignupFormData = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    privacyPolicy: false,
  };

  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);

  onSignUp(ngForm: NgForm) {
    this.errorMessage.set(null);

    if (ngForm.invalid) {
      ngForm.control.markAllAsTouched();
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage.set("Ups! Your password doesn't match.");
      return;
    }

    if (!this.signupData.privacyPolicy) {
      this.errorMessage.set('Please accept the Privacy Policy to continue.');
      return;
    }

    this.isSubmitting.set(true);
    const { email, username, password } = this.signupData;

    const first_name = username ? username.charAt(0).toUpperCase() + username.slice(1)
      : undefined;

    const payload: RegisterRequest = {
      email,
      username,
      first_name,
      password,
      color: '#1976d2',
    };

    this.auth.register(payload).subscribe({
      next: (response: RegisterResponse) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Registration failed. Please check your details and try again.');
        console.error('Registration error:', error);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible.update((v) => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible.update(v => !v);
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
