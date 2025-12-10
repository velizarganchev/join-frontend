import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ContactsService } from '../../services/contacts/contacts.service';
import { Member } from '../../models/member';

interface ContactGroup {
  letter: string;
  members: Member[];
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
  /** Loading state */
  isFetching = signal(false);

  /** Groups like: [{ letter: 'A', members: [...] }, ...] */
  groups = signal<ContactGroup[]>([]);

  /** Currently selected contact (for right panel) */
  selectedContact = signal<Member | null>(null);

  /** Dialog state for Add / Edit */
  isContactDialogOpen = signal(false);
  editingContact = signal<Member | null>(null); // null = create mode

  private readonly contactsService = inject(ContactsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadContacts();
  }

  /** Load contacts from backend and build groups */
  private loadContacts() {
    this.isFetching.set(true);

    this.contactsService
      .loadAllContacts()
      .pipe(
        tap((members) => {
          this.groups.set(this.buildGroups(members));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        complete: () => this.isFetching.set(false),
        error: () => this.isFetching.set(false),
      });
  }

  /** Build grouped + sorted structure from flat list */
  private buildGroups(members: Member[]): ContactGroup[] {
    const map = new Map<string, Member[]>();

    for (const m of members) {
      const letter = m.user.first_name?.[0]?.toUpperCase() ?? '#';
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(m);
    }

    // Sort within each letter by name
    const groups: ContactGroup[] = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, list]) => ({
        letter,
        members: list.sort((a, b) =>
          (a.user.first_name + a.user.last_name).localeCompare(
            b.user.first_name + b.user.last_name
          )
        ),
      }));

    return groups;
  }

  /** Flatten groups back to flat Member[] */
  private flattenMembers(): Member[] {
    return this.groups().flatMap((g) => g.members);
  }

  // ========== UI handlers ==========

  onSelectContact(contact: Member) {
    this.selectedContact.set(contact);
  }

  /** Click on "Add new contact" */
  onAddContact() {
    this.editingContact.set(null); // create mode
    this.isContactDialogOpen.set(true);
  }

  /** Click on "Edit" (например бутон до детайлите) */
  onEditSelectedContact() {
    const contact = this.selectedContact();
    if (!contact) return;

    this.editingContact.set(contact);
    this.isContactDialogOpen.set(true);
  }

  /** Called when dialog saves contact (create or update) */
  onContactSaved(saved: Member) {
    const flat = this.flattenMembers();
    const index = flat.findIndex((m) => m.id === saved.id);

    if (index === -1) {
      flat.push(saved); // newly created
    } else {
      flat[index] = saved; // updated
    }

    this.groups.set(this.buildGroups(flat));
    this.selectedContact.set(saved);
    this.isContactDialogOpen.set(false);
  }

  /** Called when dialog deletes a contact */
  onContactDeleted(deletedId: number) {
    const flat = this.flattenMembers().filter((m) => m.id !== deletedId);
    this.groups.set(this.buildGroups(flat));

    if (this.selectedContact()?.id === deletedId) {
      this.selectedContact.set(null);
    }

    this.isContactDialogOpen.set(false);
  }

  onCloseDialog() {
    this.isContactDialogOpen.set(false);
  }
}
