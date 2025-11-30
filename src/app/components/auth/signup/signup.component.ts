import { Component } from '@angular/core';
import { UsersService } from '../users.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  signUpData = {
    action: 'register',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyPolicy: false
  };

  constructor(private us: UsersService, private router: Router) { }

  async onSignUp(ngForm: NgForm) {
    if (ngForm.valid && this.signUpData.password === this.signUpData.confirmPassword) {
      try {
        const res: {
          user_id: number,
          username: string,
          email: string,
          token: string
        } =
          await this.us.SignInSignUpWithUsernameAndPassword(this.signUpData);
        localStorage.setItem('AuthToken', res.token);
        console.log(res);
        this.router.navigate(['/login']);
        ngForm.resetForm();
      } catch (error) {
        this.handleError(error);
      }
    } else {
      console.log('Form is invalid or passwords do not match.');
    }
  }
  private handleError(error: any) {
    console.error('An error occurred during login:', error);
    // alert('Login failed. Please check your credentials and try again.');
  }
}
