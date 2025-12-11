import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

import { ErrorService } from '../../components/shared/error.service';
import { environment } from '../../../environments/environment';
import { Member } from '../../models/member';
import { RegisterRequest } from '../../models/auth';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {

  private readonly contacts = signal<Member[]>([]);
  readonly loadedContacts = this.contacts.asReadonly();

  private readonly http = inject(HttpClient);
  private readonly errorService = inject(ErrorService);

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

  createContact(payload: RegisterRequest) {
    return this.http.post(`${environment.baseUrl}/register/`, payload, {
      withCredentials: true,
    });
  }

  updateContact(id: number, payload: any) {
    return this.http.put(`${environment.baseUrl}/contacts/${id}/`, payload, {
      withCredentials: true,
    });
  }

  deleteContact(id: number) {
    return this.http.delete(`${environment.baseUrl}/contacts/${id}/`, {
      withCredentials: true,
    });
  }
}
