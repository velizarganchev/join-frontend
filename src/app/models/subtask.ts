import { Task } from "./task.class";

export class Subtask {
    id: number;
    title: string;
    status: boolean;

    constructor(obj?: any) {
        this.id = obj?.id ?? null;
        this.title = obj?.title ?? '';
        this.status = obj?.status ?? false;
    }
}
