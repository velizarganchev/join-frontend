import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  private readonly location = inject(Location);

  /** Navigate back to previous page */
  goBack(): void {
    this.location.back();
  }
}
