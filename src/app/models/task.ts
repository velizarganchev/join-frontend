import { Member } from './member';
import { Subtask } from './subtask';

export type TaskCategory = 'user_story' | 'technical_task';
export type TaskStatus = 'todo' | 'in_progress' | 'await_feedback' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id?: number;
    title: string;
    category: TaskCategory;
    description: string;
    status: TaskStatus;
    color: string;
    priority: TaskPriority;
    members: Member[];
    created_at?: string;
    due_date: string;     // 'YYYY-MM-DD'
    checked: boolean;
    subtasks: Subtask[];
    subtasks_progress: number;
}
