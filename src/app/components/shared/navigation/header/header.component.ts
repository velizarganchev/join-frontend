import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  showHideMenu = signal(false);
  auth = inject(AuthService);
  router = inject(Router);

  toggleMenu() {
    this.showHideMenu.update(value => !value);
  }

  onLogout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        console.error('Logout failed', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
