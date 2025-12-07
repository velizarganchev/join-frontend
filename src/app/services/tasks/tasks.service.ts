import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

import { Task } from '../../models/task.class';
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
    return this.http.get<Task[]>(`${environment.baseUrl}/tasks/`, { withCredentials: true }).pipe(
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
      .get<Task>(`${environment.baseUrl}/tasks/${taskId}/`, { withCredentials: true })
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
    // Backend expects member IDs, not full objects
    const payload = {
      ...task,
      id: undefined,
      members: task.members.map((member) => member.id),
    };

    const prevTasks = this.tasks();

    return this.http
      .post<Task>(`${environment.baseUrl}/tasks/`, payload, { withCredentials: true })
      .pipe(
        catchError((error) => {
          // rollback to previous state
          this.errorService.showError('Something went wrong storing the task');
          this.tasks.set(prevTasks);
          return throwError(
            () => new Error('Something went wrong storing the task')
          );
        })
      );
  }

  // ======================
  // UPDATE
  // ======================
  updateTask(taskData: Task) {
    return this.update(taskData).pipe(
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

  private update(task: Task) {
    // Same as create: members should be IDs
    const payload = {
      ...task,
      members: task.members.map((member) => member.id),
    };

    return this.http
      .put<Task>(`${environment.baseUrl}/tasks/${task.id}/`, payload, { withCredentials: true })
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
      .delete<void>(`${environment.baseUrl}/tasks/${taskId}/`, { withCredentials: true })
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
}
