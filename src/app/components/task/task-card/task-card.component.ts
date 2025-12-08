import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Task } from '../../../models/task';
import { TasksService } from '../../../services/tasks/tasks.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  taskId = input.required<number>();

  dragStartTask = output<number>();
  dragEndTask = output<void>();

  cardClick = output<number>();

  private readonly tasksService = inject(TasksService);

  private readonly isDragging = signal(false);

  task = computed<Task | null>(() => {
    const id = this.taskId();
    const tasks = this.tasksService.loadedTasks() ?? [];
    return tasks.find((t) => t.id === id) ?? null;
  });

  completedSubtasks = computed(() => {
    const t = this.task();
    if (!t || !t.subtasks || t.subtasks.length === 0) return 0;
    return t.subtasks.filter((s) => s.status === true).length;
  });

  progressPercent = computed(() => {
    const t = this.task();
    const total = t?.subtasks?.length ?? 0;
    const done = this.completedSubtasks();
    if (!t || total === 0) return 0;
    return (done / total) * 100;
  });

  progressLabel = computed(() => {
    const t = this.task();
    const total = t?.subtasks?.length ?? 0;
    const done = this.completedSubtasks();
    if (!t || total === 0) return 'No subtasks';
    return `${done}/${total} Subtasks`;
  });


  priorityIcon = computed(() => {
    const t = this.task();
    switch (t?.priority) {
      case 'high':
        return '/assets/img/PrioHigh.png';
      case 'low':
        return '/assets/img/PrioLow.png';
      case 'medium':
      default:
        return '/assets/img/PrioMedium.png';
    }
  });

  // ========== Drag & Drop ==========

  onDragStart(event: DragEvent) {
    const id = this.taskId();
    if (id != null) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(id));
      }

      this.isDragging.set(true);
      this.dragStartTask.emit(id);
    }
  }

  onDragEnd() {
    setTimeout(() => this.isDragging.set(false), 0);
    this.dragEndTask.emit();
  }

  onCardClick() {
    if (this.isDragging()) return;

    const id = this.taskId();
    if (id != null) {
      this.cardClick.emit(id);
    }
  }
}
