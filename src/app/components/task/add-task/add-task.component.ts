import {
  Component,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClickStopPropagationDirective } from '../../shared/click-stop-propagation.directive';
import { MultiSelectDropdownComponent } from '../../shared/multi-select-dropdown/multi-select-dropdown.component';
import { TasksService } from '../../../services/tasks/tasks.service';
import { Member } from '../../../models/member';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../../models/task';
import { AddTaskStore } from '../add-task.store';
import { Router } from '@angular/router';

interface SubtaskFormGroup {
  title: FormControl<string>;
  status: FormControl<boolean>;
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClickStopPropagationDirective,
    MultiSelectDropdownComponent,
  ],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
  providers: [AddTaskStore],
})
export class AddTaskComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AddTaskStore);
  private readonly tasksService = inject(TasksService);
  private readonly router = inject(Router);

  // =============== STORE SIGNALS ===============

  bgColor = this.store.bgColor;
  priority = this.store.priority;
  subtaskInput = this.store.subtaskInput;
  showAddSubtaskIcons = this.store.showAddSubtaskIcons;
  isSubmitting = this.store.isSubmitting;

  // =============== FORM ===============

  readonly taskForm = this.fb.group({
    title: ['', Validators.required],
    category: ['user_story', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    color: ['#2a3647', Validators.required],
    priority: [null as TaskPriority | null, Validators.required],
    due_date: ['', Validators.required],
    checked: [false],
    members: [[] as Member[]],
    subtasks: this.fb.array<FormGroup<SubtaskFormGroup>>([]),
  });


  get subtasksArray(): FormArray<FormGroup<SubtaskFormGroup>> {
    return this.taskForm.controls.subtasks as FormArray<FormGroup<SubtaskFormGroup>>;
  }

  private createSubtaskGroup(initialTitle: string): FormGroup<SubtaskFormGroup> {
    return this.fb.group<SubtaskFormGroup>({
      title: this.fb.nonNullable.control(initialTitle, {
        validators: [Validators.required],
      }),
      status: this.fb.nonNullable.control(false),
    });
  }

  // =============== FORM → TASK MAP ===============

  private mapFormToTask(): Task {
    const raw = this.taskForm.getRawValue() as {
      title: string;
      category: string;
      description: string;
      status: string;
      color: string;
      priority: TaskPriority | null;
      due_date: string;
      checked: boolean | null;
      members: Member[];               // <-- ТУК
      subtasks: { title: string; status: boolean }[];
    };

    return {
      id: undefined,
      title: raw.title,
      category: raw.category as TaskCategory,
      description: raw.description,
      status: raw.status as TaskStatus,
      color: raw.color,
      priority: (raw.priority ?? 'medium') as TaskPriority,
      members: raw.members,            // <-- подаваме Member[]
      created_at: undefined,
      due_date: raw.due_date,
      checked: raw.checked ?? false,
      subtasks: raw.subtasks.map((st) => ({
        id: undefined,
        title: st.title,
        status: st.status,
      })),
      subtasks_progress: 0,
    };
  }


  // =============== HANDLERS ===============

  onHandleSelectedContacts(contacts: Member[]) {
    this.taskForm.controls.members.setValue(contacts);
  }

  choosePrio(prio: TaskPriority) {
    this.store.setPriority(prio);
    this.taskForm.controls.priority.setValue(prio);
  }

  onTogleSubtaskIcons() {
    this.store.toggleSubtaskIcons();
  }

  onSubtaskInputChange(value: string) {
    this.store.setSubtaskInput(value);
  }

  onAddSubtask() {
    const title = this.subtaskInput().trim();
    if (!title) {
      return;
    }

    this.subtasksArray.push(this.createSubtaskGroup(title));
    this.store.setSubtaskInput('');
    this.store.toggleSubtaskIcons();
  }

  editingIndex: number | null = null;
  private originalSubtaskTitle = '';

  onStartEditSubtask(index: number) {
    const ctrl = this.subtasksArray.at(index);
    if (!ctrl) return;

    this.editingIndex = index;
    this.originalSubtaskTitle = ctrl.value.title ?? '';
  }

  onConfirmEditSubtask() {
    if (this.editingIndex === null) return;

    const ctrl = this.subtasksArray.at(this.editingIndex);
    if (!ctrl) return;

    const titleCtrl = ctrl.controls.title;
    const trimmed = titleCtrl.value.trim();

    titleCtrl.setValue(trimmed);
    titleCtrl.markAsTouched();

    if (!trimmed) {
      return;
    }

    this.editingIndex = null;
    this.originalSubtaskTitle = '';
  }


  onCancelEditSubtask(index: number) {
    const ctrl = this.subtasksArray.at(index);
    if (!ctrl) return;

    ctrl.patchValue({ title: this.originalSubtaskTitle });
    this.editingIndex = null;
    this.originalSubtaskTitle = '';
  }


  isEditingSubtask(index: number): boolean {
    return this.editingIndex === index;
  }

  onDeleteSubtask(index: number) {
    this.subtasksArray.removeAt(index);
  }


  onCreateTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.store.setSubmitting(true);

    const taskPayload = this.mapFormToTask();

    this.tasksService.addTask(taskPayload).subscribe({
      next: () => {
        this.store.setSubmitting(false);
        this.taskForm.reset();
        this.store.resetUiState();
        this.router.navigate(['/board']);
      },
      error: () => {
        this.store.setSubmitting(false);
      },
    });
  }
}
