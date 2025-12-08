import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

import { Task, TaskStatus } from '../../models/task';
import { environment } from '../../../environments/environment';
import { ErrorService } from '../../components/shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  /**
   * Holds the current list of tasks in memory.
   * All components should subscribe via `loadedTasks`.
   */
  private readonly tasks = signal<Task[]>([]);
  readonly loadedTasks = this.tasks.asReadonly();

  private readonly http = inject(HttpClient);
  private readonly errorService = inject(ErrorService);

  // ======================
  // LOAD
  // ======================

  loadAllTasks() {
    return this.http
      .get<Task[]>(`${environment.baseUrl}/tasks/`, {
        withCredentials: true,
      })
      .pipe(
        tap({
          next: (tasks) => this.tasks.set(tasks),
        }),
        catchError((error) => {
          this.errorService.showError(
            'Something went wrong fetching all tasks'
          );
          return throwError(
            () => new Error('Something went wrong fetching all tasks')
          );
        })
      );
  }

  getSingleTask(taskId: number) {
    return this.http
      .get<Task>(`${environment.baseUrl}/tasks/${taskId}/`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          this.errorService.showError(
            'Something went wrong fetching the task'
          );
          return throwError(
            () => new Error('Something went wrong fetching the task')
          );
        })
      );
  }

  // ======================
  // CREATE
  // ======================

  addTask(taskData: Task) {
    return this.storeTask(taskData).pipe(
      tap({
        next: (newTask) => {
          this.tasks.update((oldTasks) => {
            // avoid duplicates by id
            if (oldTasks.find((t) => t.id === newTask.id)) {
              return oldTasks;
            }
            return [...oldTasks, newTask];
          });
        },
      })
    );
  }

  private storeTask(task: Task) {
    const payload = {
      ...task,
      id: undefined,
      members: task.members.map((member) => member.id),
    };

    const prevTasks = this.tasks();

    return this.http
      .post<Task>(`${environment.baseUrl}/tasks/`, payload, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          this.errorService.showError('Something went wrong storing the task');
          this.tasks.set(prevTasks);
          return throwError(
            () => new Error('Something went wrong storing the task')
          );
        })
      );
  }

  /**
   * Update a task (used by Edit dialog).
   * Internally uses HTTP PATCH, not PUT.
   */
  updateTask(taskData: Task) {
    return this.patchTask(taskData).pipe(
      tap({
        next: (updatedTask) => {
          this.tasks.update((oldTasks) =>
            oldTasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            )
          );
        },
      })
    );
  }

  /**
   * Sends PATCH for full Task object.
   */
  private patchTask(task: Task) {
    // Same as create: members should be IDs
    const payload = {
      ...task,
      members: task.members.map((member) => member.id),
    };

    return this.http
      .patch<Task>(`${environment.baseUrl}/tasks/${task.id}/`, payload, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          this.errorService.showError('Something went wrong updating the task');
          return throwError(
            () => new Error('Something went wrong updating the task')
          );
        })
      );
  }

  // ======================
  // DELETE
  // ======================

  deleteTask(taskId: number) {
    const prevTasks = this.tasks();

    return this.http
      .delete<void>(`${environment.baseUrl}/tasks/${taskId}/`, {
        withCredentials: true,
      })
      .pipe(
        tap({
          next: () => {
            // Remove task locally
            this.tasks.update((oldTasks) =>
              oldTasks.filter((task) => task.id !== taskId)
            );
          },
        }),
        catchError((error) => {
          this.errorService.showError('Something went wrong deleting the task');
          // rollback
          this.tasks.set(prevTasks);
          return throwError(
            () => new Error('Something went wrong deleting the task')
          );
        })
      );
  }

  // ======================
  // STATUS UPDATE (PATCH само status)
  // ======================

  /**
   * Public API method – orchestrates optimistic local update + HTTP PATCH.
   */
  updateTaskStatus(taskId: number, status: TaskStatus) {
    const prevTasks = this.tasks();

    // 1) Optimistic update
    this.applyOptimisticStatusUpdate(taskId, status);

    // 2) HTTP PATCH
    return this.sendStatusPatchRequest(taskId, status).pipe(
      tap({
        next: (updatedTask) => this.applyServerStatusResponse(updatedTask),
      }),
      catchError((error) =>
        this.handleStatusUpdateError(error, prevTasks)
      )
    );
  }

  /**
   * Updates the task status locally (optimistic update).
   */
  private applyOptimisticStatusUpdate(
    taskId: number,
    status: TaskStatus
  ): void {
    this.tasks.update((oldTasks) =>
      oldTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  }

  /**
   * Sends the HTTP PATCH request to update only the status field.
   */
  private sendStatusPatchRequest(taskId: number, status: TaskStatus) {
    return this.http.patch<Task>(
      `${environment.baseUrl}/tasks/${taskId}/`,
      { status },
      { withCredentials: true }
    );
  }

  /**
   * Synchronizes the local tasks state with the server response.
   */
  private applyServerStatusResponse(updatedTask: Task): void {
    this.tasks.update((oldTasks) =>
      oldTasks.map((task) => {
        if (task.id !== updatedTask.id) {
          return task;
        }
        return {
          ...task,
          status: updatedTask.status,
        };
      })
    );
  }


  /**
   * Handles errors for status updates: rollback & user-facing error.
   */
  private handleStatusUpdateError(error: unknown, prevTasks: Task[]) {
    this.tasks.set(prevTasks);
    this.errorService.showError(
      'Something went wrong updating task status'
    );
    return throwError(
      () => new Error('Something went wrong updating task status')
    );
  }

  // ======================
  // SUBTASK STATUS (PATCH)
  // ======================

  updateSubtaskStatus(taskId: number, subtaskId: number, status: boolean) {
    const prevTasks = this.tasks();

    // optimistic update
    this.tasks.update((oldTasks) =>
      oldTasks.map((task) => {
        if (task.id !== taskId || !task.subtasks) return task;

        const updatedSubtasks = task.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, status } : sub
        );

        const completedCount = updatedSubtasks.filter(
          (sub) => sub.status === true
        ).length;

        return {
          ...task,
          subtasks: updatedSubtasks,
        };
      })
    );

    return this.http
      .patch(
        `${environment.baseUrl}/subtask/${subtaskId}/`,
        { status },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          this.tasks.set(prevTasks);
          this.errorService.showError(
            'Something went wrong updating the subtask'
          );
          return throwError(
            () => new Error('Something went wrong updating the subtask')
          );
        })
      );
  }
}
