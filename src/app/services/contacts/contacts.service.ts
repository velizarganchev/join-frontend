import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

import { ErrorService } from '../../components/shared/error.service';
import { environment } from '../../../environments/environment';
import { Member } from '../../models/member';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  /**
   * Holds all contacts loaded from the backend.
   * Components should subscribe via `loadedContacts`.
   */
  private readonly contacts = signal<Member[]>([]);
  readonly loadedContacts = this.contacts.asReadonly();

  private readonly http = inject(HttpClient);
  private readonly errorService = inject(ErrorService);

  // ======================
  // LOAD
  // ======================
  loadAllContacts() {
    return this.http.get<Member[]>(`${environment.baseUrl}/contacts/`, { withCredentials: true }).pipe(
      tap({
        next: (contacts) => this.contacts.set(contacts),
      }),
      catchError((error) => {
        this.errorService.showError(
          'Something went wrong fetching all contacts'
        );
        return throwError(
          () => new Error('Something went wrong fetching all contacts')
        );
      })
    );
  }
}
