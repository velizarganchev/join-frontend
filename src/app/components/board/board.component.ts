import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { TasksService } from '../../services/tasks/tasks.service';
import { Task, TaskStatus } from '../../models/task';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { TaskDialogComponent } from "../task/task-dialog/task-dialog.component";

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskCardComponent, TaskDialogComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly router = inject(Router);

  error = signal('');
  isFetching = signal(false);

  tasks = this.tasksService.loadedTasks;

  highlightedColumn = signal<TaskStatus | null>(null);

  draggedTaskId = signal<number | null>(null);

  selectedTaskId = signal<number | null>(null);
  showTaskDialog = signal(false);

  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.isFetching.set(true);

    this.tasksService.loadAllTasks().subscribe({
      error: (error: Error) => {
        this.error.set(error.message);
        this.isFetching.set(false);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });
  }

  openAddTask(status?: TaskStatus | '') {
    const queryParams = status ? { status } : undefined;
    this.router.navigate(['/add-task'], { queryParams });
  }

  onSearchTermChange(value: string) {
    this.searchTerm.set(value.toLowerCase());
  }

  getTaskByStatus(status: TaskStatus): Task[] {
    const all = this.tasks() ?? [];
    const term = this.searchTerm().trim();

    return all.filter((task) => {
      if (task.status !== status) return false;
      if (!term) return true;

      const haystack =
        `${task.title} ${task.description ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }

  // ========== DRAG & DROP ==========

  onDragStartTask(taskId: number) {
    this.draggedTaskId.set(taskId);
  }

  onDragEndTask() {
    this.draggedTaskId.set(null);
    this.highlightedColumn.set(null);
  }

  onDragOver(event: DragEvent, column: TaskStatus) {
    event.preventDefault(); // критично!
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.highlightedColumn.set(column);
  }

  onDragLeave(column: TaskStatus) {
    if (this.highlightedColumn() === column) {
      this.highlightedColumn.set(null);
    }
  }

  onDrop(event: DragEvent, column: TaskStatus) {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    this.highlightedColumn.set(null);

    if (taskId == null) return;

    this.tasksService.updateTaskStatus(taskId, column).subscribe({
      next: () => { },
      error: (err) => console.error(err),
    });

    this.draggedTaskId.set(null);
  }

  openTaskDialog(taskId: number) {
    this.selectedTaskId.set(taskId);
    this.showTaskDialog.set(true);
  }

  closeTaskDialog() {
    this.showTaskDialog.set(false);
    this.selectedTaskId.set(null);
  }

  onTaskDeleted() {
    this.closeTaskDialog();
  }

  onTaskUpdated() {
    this.closeTaskDialog();
  }

}
