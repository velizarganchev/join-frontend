import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../../services/contacts/contacts.service';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.scss'
})
export class MultiSelectDropdownComponent implements OnInit {
  isFetching = signal(false);
  showDropDown = false;

  @Output() shareCheckedList = new EventEmitter();

  checkedList: any[];

  private contactsService = inject(ContactsService);
  destroyRef = inject(DestroyRef);

  contacts: any;

  constructor() {
    this.checkedList = [];
  }

  ngOnInit(): void {
    this.isFetching.set(true);

    const sub = this.contactsService.loadAllContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts.map((member) => ({
          id: member.id,
          firstName: member.user.first_name,
          lastName: member.user.last_name,
          color: member.color,
          fullName: `${member.user.first_name} ${member.user.last_name}`,
          checked: false
        }));
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  onOpenDropDown() {
    this.showDropDown = !this.showDropDown;
  }

  getSelectedValue(status: Boolean, contact: any) {
    if (status) {
      this.checkedList.push(contact);
    } else {
      var index = this.checkedList.indexOf(contact);
      this.checkedList.splice(index, 1);
    }
  }

  shareCheckedContacts() {
    this.showDropDown = false;
    this.shareCheckedList.emit(this.checkedList);
  }
}
