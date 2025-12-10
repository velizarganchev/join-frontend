import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks/tasks.service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-summery',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './summery.component.html',
  styleUrl: './summery.component.scss'
})
export class SummeryComponent {
  private readonly taskService = inject(TasksService);
  private readonly authService = inject(AuthService);

  getWelcomeUsername() {
    return this.authService.currentUser()?.username || 'Guest';
  }

  readonly allTasks = this.taskService.loadedTasks;

  readonly totalCount = computed(
    () => this.allTasks().length
  );

  readonly todoCount = computed(
    () => this.allTasks().filter(t => t.status === 'todo').length
  );

  readonly doneCount = computed(
    () => this.allTasks().filter(t => t.status === 'done').length
  );

  readonly inProgressCount = computed(
    () => this.allTasks().filter(t => t.status === 'in_progress').length
  );

  readonly awaitingCount = computed(
    () => this.allTasks().filter(t => t.status === 'await_feedback').length
  );

  ngOnInit() {
    this.taskService.loadAllTasks().subscribe();
  }

  private readonly priorityOrder: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  readonly upcomingTask = computed(() => {
    const tasks = this.allTasks().filter(t => t.status !== 'done');

    if (!tasks.length) {
      return null;
    }

    const sorted = [...tasks].sort((a, b) => {
      const prioDiff =
        this.priorityOrder[a.priority] - this.priorityOrder[b.priority];

      if (prioDiff !== 0) {
        return prioDiff; // high (0) излиза пред medium (1), пред low (2)
      }

      // сравняваме по due_date (формат 'YYYY-MM-DD')
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();

      return dateA - dateB; // по-скоро падеж първи
    });

    return sorted[0];
  });

  // Ако искаш готов label за priority (за показване):
  readonly upcomingPriorityLabel = computed(() => {
    const task = this.upcomingTask();
    if (!task) {
      return '';
    }
    // малко козметика: 'high' -> 'High', 'medium' -> 'Medium'
    return task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  });
}
