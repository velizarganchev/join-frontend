import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ErrorService } from '../../components/shared/error.service';
import { environment } from '../../../environments/environment.prod';

import { Member } from '../../models/member';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private contacts = signal<Member[] | undefined>([]);
  loadedContact = this.contacts.asReadonly();

  http = inject(HttpClient);
  errorService = inject(ErrorService);

  loadAllContacts() {
    return this.fetchAllContacts().pipe(
      tap({
        next: (contacts) => this.contacts.set(contacts),
      })
    );
  }

  private fetchAllContacts() {
    return this.http
      .get<Member[]>(`${environment.baseUrl}/contacts/`)
      .pipe(
        catchError((error) => {
          this.errorService.showError(
            'Something went wrong fetching the all Contacts'
          );
          return throwError(
            () => new Error('Something went wrong fetching the all Contacts')
          );
        })
      );
  }
}
