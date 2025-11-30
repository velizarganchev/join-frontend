import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorService } from './components/shared/error.service';
import { ErrorModalComponent } from "./components/shared/modal/error-modal/error-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Join';
  private errorService = inject(ErrorService);
  error = this.errorService.error;
}
