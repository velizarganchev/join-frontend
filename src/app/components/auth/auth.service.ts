import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  AuthUser,
} from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  private _currentUser = signal<AuthUser | null>(null);
  currentUser = this._currentUser.asReadonly();

  isAuthenticated = computed(() => this._currentUser() !== null);
  isAuthLoading = signal(false);

  constructor() {
    const storedUser = sessionStorage.getItem('auth_user');
    if (storedUser) {
      try {
        this._currentUser.set(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem('auth_user');
      }
    }
  }

  register(request: RegisterRequest) {
    this.isAuthLoading.set(true);
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register/`, request, { withCredentials: true }).pipe(
      tap({
        next: () => this.isAuthLoading.set(false),
        error: () => this.isAuthLoading.set(false),
      })
    );
  }

  login(request: LoginRequest) {
    this.isAuthLoading.set(true);
    return this.http.post<LoginResponse>(`${this.baseUrl}/login/`, request, { withCredentials: true }).pipe(
      tap({
        next: () => {
          const authUser: AuthUser = {
            id: request.email as unknown as number, // Assuming email is unique identifier
            username: request.email.split('@')[0], // Deriving username from email
          };
          this._currentUser.set(authUser);
          sessionStorage.setItem('auth_user', JSON.stringify(authUser));
          this.isAuthLoading.set(false);
        },
        error: () => this.isAuthLoading.set(false),
      })
    );
  }

  refresh() {
    return this.http.post(
      `${this.baseUrl}/refresh/`,
      {},
      { withCredentials: true }
    );
  }


  logout() {
    this.isAuthLoading.set(true);

    return this.http.post(`${this.baseUrl}/logout/`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => {
          this.removeAuthData();
          this.isAuthLoading.set(false);
        },
        error: () => {
          this.removeAuthData();
          this.isAuthLoading.set(false);
        },
      })
    );
  }

  removeAuthData() {
    this._currentUser.set(null);
    sessionStorage.removeItem('auth_user');
  }
}