import { inject, Injectable, signal } from '@angular/core';
import { Task } from '../../models/task.class';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { ErrorService } from '../../components/shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private tasks = signal<Task[] | undefined>([]);
  loadedTasks = this.tasks.asReadonly();

  http = inject(HttpClient);
  errorService = inject(ErrorService);

  loadAllTasks() {
    return this.fetchAllTasks().pipe(
      tap({
        next: (tasks) => this.tasks.set(tasks),
      })
    );
  }

  private fetchAllTasks() {
    return this.http
      .get<Task[]>(`${environment.baseUrl}/tasks/`)
      .pipe(
        catchError((error) => {
          this.errorService.showError(
            'Something went wrong fetching the all Tasks'
          );
          return throwError(
            () => new Error('Something went wrong fetching the all Tasks')
          );
        })
      );
  }

  getSingleTask(taskId: number) { }

  addTask(taskData: Task) {
    return this.storeTask(taskData).pipe(
      tap({
        next: (newTask) => {
          const prevTasks = this.tasks() || [];

          if (prevTasks.find((task) => task.id === newTask.id) === undefined) {
            this.tasks.update((oldTasks) => [...oldTasks!, newTask]);
          }
        },
      })
    );
  }

  private storeTask(task: Task) {
    const newTask = {
      ...task,
      id: undefined,
      members: task.members.map((member) => member.id),
    };
    const prevTasks = this.tasks() || [];

    return this.http
      .post<Task>(`${environment.baseUrl}/tasks/`, newTask)
      .pipe(
        catchError((error) => {
          this.errorService.showError('Something went wrong store the Task');
          this.tasks.set(prevTasks);
          return throwError(
            () => new Error('Something went wrong store the Task')
          );
        })
      );
  }

  updateTask(taskData: Task) {
    const taskToUpdate = this.tasks()?.find((task) => task.id === taskData.id);
    if (taskToUpdate) {
      return this.update(taskToUpdate).pipe(
        tap({
          next: (tasks) => {
            this.tasks.set(tasks);
          },
        })
      );
    }
    return this.tasks;
  }

  private update(task: Task) {
    return this.http
      .put<Task[]>(`${environment.baseUrl}/tasks/${task.id}/`, task)
      .pipe(
        catchError((error) => {
          this.errorService.showError('Something went wrong update the Task');
          return throwError(
            () => new Error('Something went wrong update the Task')
          );
        })
      );
  }

  deleteTask(taskId: number) {
    return this.delete(taskId).pipe(
      tap({
      })
    );
  }

  private delete(id: number) {
    return this.http
      .delete<void>(`${environment.baseUrl}/tasks/${id}/`)
      .pipe(
        catchError((error) => {
          this.errorService.showError('Something went wrong delete the Task');
          return throwError(
            () => new Error('Something went wrong delete the Task')
          );
        })
      );
  }
}
