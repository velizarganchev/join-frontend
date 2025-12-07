import { Injectable, computed, signal } from '@angular/core';
import { TaskPriority } from '../../models/task';

@Injectable()
export class AddTaskStore {
    readonly priority = signal<TaskPriority | null>(null);
    readonly subtaskInput = signal('');
    readonly showAddSubtaskIcons = signal(false);
    readonly isSubmitting = signal(false);

    readonly bgColor = computed(() => {
        switch (this.priority()) {
            case 'low':
                return 'limegreen';
            case 'medium':
                return 'orange';
            case 'high':
                return 'red';
            default:
                return 'orange';
        }
    });

    setPriority(prio: TaskPriority) {
        this.priority.set(prio);
    }

    toggleSubtaskIcons() {
        this.showAddSubtaskIcons.update((v) => !v);
    }

    setSubtaskInput(value: string) {
        this.subtaskInput.set(value);
    }

    setSubmitting(isSubmitting: boolean) {
        this.isSubmitting.set(isSubmitting);
    }

    resetUiState() {
        this.priority.set(null);
        this.subtaskInput.set('');
        this.showAddSubtaskIcons.set(false);
        this.isSubmitting.set(false);
    }
}
