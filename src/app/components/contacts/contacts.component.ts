import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ContactsService } from '../../services/contacts/contacts.service';
import { Member } from '../../models/member';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  Object = Object;

  isFetching = signal(false);
  members = signal<Record<string, Member[]>>({});

  selectedContact?: Member;
  showDropDown = false;

  private contactsService = inject(ContactsService);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);

    this.contactsService.loadAllContacts().pipe(
      tap((members) => {
        const groupedMembers = members.reduce((result: Record<string, Member[]>, current: Member) => {
          const key = current.user.first_name?.[0]?.toUpperCase() ?? '#';
          (result[key] = result[key] || []).push(current);
          return result;
        }, {});

        this.members.set(groupedMembers);
      }),
    ).subscribe({
      complete: () => {
        this.isFetching.set(false);
      },
      error: () => {
        this.isFetching.set(false);
      }
    });
  }


  get sortedMemberKeys(): string[] {
    return Object.keys(this.members()).sort();
  }

  onSelectContact(contact: Member) {
    this.selectedContact = contact;
  }
}
