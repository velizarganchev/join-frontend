import { Member } from "./member";
import { Subtask } from "./subtask";

export class Task {
    id: number;
    title: string;
    category: string;
    description: string;
    status: string;
    color: string;
    priority: string;
    members: Member[];
    created_at: string;
    due_date: string;
    checked: boolean;
    subtasks: Subtask[];
    subtasks_progress: number;

    constructor(obj?: any) {
        this.id = obj?.id ?? null;
        this.title = obj?.title ?? '';
        this.category = obj?.category ?? '';
        this.description = obj?.description ?? '';
        this.status = obj?.status ?? '';
        this.color = obj?.color ?? '';
        this.priority = obj?.priority ?? '';
        this.members = Array.isArray(obj?.members) ? obj.members.map((m: any) => new Member(m)) : [];
        this.created_at = obj?.created_at ?? new Date().toISOString();
        this.due_date = obj?.due_date ?? new Date().toISOString();
        this.checked = obj?.checked ?? false;
        this.subtasks = Array.isArray(obj?.subtasks) ? obj.subtasks.map((s: any) => new Subtask(s)) : [];
        this.subtasks_progress = obj?.subtasks_progress ?? 0;
    }
}
