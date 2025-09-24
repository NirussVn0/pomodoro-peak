import type { AppStore } from '../state/app-store';
import type { UuidPort } from '../ports/uuid-port';
import type { TaskTemplate } from '../../domain/entities/task';
import { createTaskFromTemplate } from '../state/app-reducer';
import type { TimePort } from '../ports/time-port';

export class TodoService {
  constructor(
    private readonly store: AppStore,
    private readonly uuid: UuidPort,
    private readonly time: TimePort,
  ) {}

  addTask(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const id = this.uuid.generate();
    const state = this.store.getState();
    const order = state.tasks.length;
    const timestamp = this.time.now();
    const task = {
      id,
      title: trimmed,
      completed: false,
      subtasks: [],
      tags: [],
      createdAt: timestamp,
      order,
    } as const;
    this.store.dispatch({ type: 'tasks/add', task });
  }

  updateTitle(id: string, title: string): void {
    this.store.dispatch({ type: 'tasks/update', id, update: { title } });
  }

  toggleTask(id: string): void {
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }
    this.store.dispatch({ type: 'tasks/update', id, update: { completed: !task.completed } });
  }

  removeTask(id: string): void {
    this.store.dispatch({ type: 'tasks/remove', id });
  }

  reorder(orderedIds: readonly string[]): void {
    this.store.dispatch({ type: 'tasks/reorder', orderedIds });
  }

  addSubtask(taskId: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const subtask = { id: this.uuid.generate(), title: trimmed, completed: false } as const;
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }
    this.store.dispatch({
      type: 'tasks/replace-subtasks',
      taskId,
      subtasks: [...task.subtasks, subtask],
    });
  }

  toggleSubtask(taskId: string, subtaskId: string): void {
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }
    const subtask = task.subtasks.find((item) => item.id === subtaskId);
    if (!subtask) {
      return;
    }
    this.store.dispatch({
      type: 'tasks/update-subtask',
      taskId,
      subtask: { ...subtask, completed: !subtask.completed },
    });
  }

  removeSubtask(taskId: string, subtaskId: string): void {
    this.store.dispatch({ type: 'tasks/remove-subtask', taskId, subtaskId });
  }

  addTag(taskId: string, label: string): void {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }
    if (task.tags.some((tag) => tag.label.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const newTag = { id: this.uuid.generate(), label: trimmed } as const;
    this.store.dispatch({
      type: 'tasks/update',
      id: taskId,
      update: { tags: [...task.tags, newTag] },
    });
  }

  removeTag(taskId: string, tagId: string): void {
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }
    this.store.dispatch({
      type: 'tasks/update',
      id: taskId,
      update: { tags: task.tags.filter((tag) => tag.id !== tagId) },
    });
  }

  applyTemplate(template: TaskTemplate): void {
    const state = this.store.getState();
    const baseOrder = state.tasks.length;
    const timestamp = this.time.now();
    const tasks = template.items.map((item, index) =>
      createTaskFromTemplate(item, {
        id: this.uuid.generate(),
        order: baseOrder + index,
        timestamp,
      }),
    );
    this.store.dispatch({ type: 'tasks/apply-template', tasks });
  }
}
