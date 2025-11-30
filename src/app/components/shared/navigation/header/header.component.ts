import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UsersService } from '../../../auth/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  showHideMenu = false;

  constructor(private us: UsersService, private router: Router) { }

  ToggleMenu() {
    this.showHideMenu = !this.showHideMenu;
  }

  onLogout() {
    this.us.Logout().subscribe({
      next: (response) => {
        console.log('Logout erfolgreich:', response);
        localStorage.removeItem('AuthToken');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout fehlgeschlagen:', error);
      }
    })
  }
}
