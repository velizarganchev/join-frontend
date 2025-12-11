import { Component, inject, output, signal } from '@angular/core';
import { ContactsService } from '../../../services/contacts/contacts.service';
import { ErrorService } from '../../shared/error.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-contact-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-contact-dialog.component.html',
  styleUrl: './add-contact-dialog.component.scss'
})
export class AddContactDialogComponent {
  close = output<void>();
  created = output<void>();

  private readonly contactsService = inject(ContactsService);
  private readonly errorService = inject(ErrorService);
  private readonly fb = inject(FormBuilder);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', Validators.required],
    color: ['#29ABE2'],
  });

  onClose() {
    this.close.emit();
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);

    const payload = {
      username: `${this.form.value.first_name!.toLowerCase()}_${Date.now()}`,
      first_name: this.form.value.first_name!,
      last_name: this.form.value.last_name!,
      email: this.form.value.email!,
      phone_number: this.form.value.phone_number!,
      password: null,
      color: this.form.value.color!,
    };

    this.contactsService.createContact(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
        this.close.emit();
      },
      error: () => {
        this.loading.set(false);
        this.errorService.showError('Failed to create contact');
      },
    });
  }
}
