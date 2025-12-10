import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TasksService } from '../../../services/tasks/tasks.service';
import { Task } from '../../../models/task';
import { Member } from '../../../models/member';
import { ContactsService } from '../../../services/contacts/contacts.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent {
  private readonly tasksService = inject(TasksService);
  private readonly contactsService = inject(ContactsService);
  private readonly fb = inject(FormBuilder);

  taskId = input.required<number>();

  allUsers = signal<Member[]>([]);
  selectedMembers = signal<Member[]>([]);
  dropdownOpen = signal(false);
  confirmDelete = signal(false);

  close = output<void>();
  deleted = output<void>();
  updated = output<void>();

  mode = signal<'view' | 'edit'>('view');

  task = computed<Task | null>(() => {
    const id = this.taskId();
    const tasks = this.tasksService.loadedTasks() ?? [];
    return tasks.find((t) => t.id === id) ?? null;
  });

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    due_date: ['', Validators.required],
    priority: ['medium' as 'low' | 'medium' | 'high'],
    members: this.fb.nonNullable.control<number[]>([]),
  });

  constructor() {

    this.contactsService.loadAllContacts().subscribe({
      next: (contacts) => {
        this.allUsers.set(contacts);
        console.log(this.allUsers());

      },
    });

    effect(() => {
      const t = this.task();
      if (!t) return;

      if (this.mode() === 'edit') {
        return;
      }

      this.form.patchValue({
        title: t.title,
        description: t.description ?? '',
        due_date: t.due_date,
        priority: t.priority as 'low' | 'medium' | 'high',
        members: t.members.map(member => member.id),
      });
    });

    effect(() => {
      const ids = this.form.controls.members.value ?? [];
      const all = this.allUsers();
      this.selectedMembers.set(all.filter((u) => ids.includes(u.id)));
    });
  }


  /** Priority label helper */
  priorityLabel(priority: string | null | undefined) {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'low':
        return 'Low';
      case 'medium':
      default:
        return 'Medium';
    }
  }

  enterEditMode() {
    this.mode.set('edit');
  }

  cancelEdit() {
    this.mode.set('view');
    const t = this.task();
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description ?? '',
        due_date: t.due_date,
        priority: t.priority as 'low' | 'medium' | 'high',
      });
    }
  }

  onToggleSubtask(subtaskId: number, checked: boolean) {
    const t = this.task();
    if (!t || t.id == null) return;

    this.tasksService.updateSubtaskStatus(t.id, subtaskId, checked).subscribe();
  }

  saveChanges() {
    const t = this.task();
    if (!t || this.form.invalid) return;

    const value = this.form.getRawValue();

    const all = this.allUsers?.() ?? [];

    const selectedMembers = all.filter((user) =>
      value.members.includes(user.id)
    );

    const updatedTask: Task = {
      ...t,
      title: value.title,
      description: value.description,
      due_date: value.due_date,
      priority: value.priority,
      members: selectedMembers,
    };

    this.tasksService.updateTask(updatedTask).subscribe({
      next: () => {
        this.mode.set('view');
        this.updated.emit();
      },
      error: (err) => {
        console.error('Error updating task', err);
      },
    });
  }


  /** Delete */

  askDelete() {
    this.confirmDelete.set(true);
  }

  cancelDeleteConfirm() {
    this.confirmDelete.set(false);
  }

  confirmDeleteTask() {
    const t = this.task();
    if (!t || t.id == null) return;

    this.tasksService.deleteTask(t.id).subscribe({
      next: () => {
        this.confirmDelete.set(false);
        this.deleted.emit();
      },
      error: (err) => {
        console.error('Error deleting task', err);
        this.confirmDelete.set(false);
      },
    });
  }


  setPriority(level: 'low' | 'medium' | 'high') {
    this.form.patchValue({ priority: level });
  }

  isPriority(level: 'low' | 'medium' | 'high'): boolean {
    return this.form.value.priority === level;
  }

  toggleDropdown() {
    this.dropdownOpen.update((open) => !open);
  }

  toggleMember(id: number, checked: boolean) {
    const current = [...(this.form.controls.members.value ?? [])];

    if (checked && !current.includes(id)) {
      current.push(id);
    } else if (!checked) {
      const idx = current.indexOf(id);
      if (idx > -1) {
        current.splice(idx, 1);
      }
    }

    this.form.controls.members.setValue(current);
  }

  /** Close dialog */
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('task-dialog-overlay')) {
      this.close.emit();
    }
  }

  onCloseClick() {
    this.close.emit();
  }
}
