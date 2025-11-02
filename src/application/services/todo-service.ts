import type { AppStore } from '../state/app-store';
import type { UuidPort } from '../ports/uuid-port';
import type { TaskTemplate } from '../../domain/entities/task';
import { createEmptyTask, createSubtask } from '../../domain/entities/task';
import { createTaskFromTemplate } from '../state/app-reducer';
import type { TimePort } from '../ports/time-port';

export class TodoService {
  constructor(
    private readonly store: AppStore,
    private readonly uuid: UuidPort,
    private readonly time: TimePort,
  ) {}

  focusTask(id: string): void {
    const state = this.store.getState();
    const task = state.tasks.find((item) => item.id === id);
    if (!task || task.completed) {
      return;
    }
    this.store.dispatch({ type: 'tasks/set-active', id });
  }

  addTask(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const id = this.uuid.generate();
    const state = this.store.getState();
    const order = state.tasks.length;
    const timestamp = this.time.now();
    const task = createEmptyTask({ id, title: trimmed, order, timestamp });
    this.store.dispatch({ type: 'tasks/add', task });
    this.syncActiveTask();
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
    const nextCompleted = !task.completed;
    const nextSubtasks = task.subtasks.map((subtask) => ({ ...subtask, completed: nextCompleted }));
    this.store.dispatch({
      type: 'tasks/update',
      id,
      update: { completed: nextCompleted, subtasks: nextSubtasks },
    });
    this.applyAutoSort();
    this.syncActiveTask();
  }

  removeTask(id: string): void {
    this.store.dispatch({ type: 'tasks/remove', id });
    this.applyAutoSort();
    this.syncActiveTask();
  }

  reorder(orderedIds: readonly string[]): void {
    this.store.dispatch({ type: 'tasks/reorder', orderedIds });
    this.syncActiveTask();
  }

  addSubtask(taskId: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const subtask = createSubtask({ id: this.uuid.generate(), title: trimmed });
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
    this.syncActiveTask();
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
    this.syncActiveTask();
  }

  removeSubtask(taskId: string, subtaskId: string): void {
    this.store.dispatch({ type: 'tasks/remove-subtask', taskId, subtaskId });
    this.syncActiveTask();
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
    this.applyAutoSort();
    this.syncActiveTask();
  }

  private applyAutoSort(): void {
    const settings = this.store.getState().settings.tasks;
    if (!settings.autoSortCompleted) {
      return;
    }
    const orderedIds = this.store
      .getState()
      .tasks.slice()
      .sort((a, b) => {
        if (a.completed === b.completed) {
          return a.order - b.order;
        }
        return a.completed ? 1 : -1;
      })
      .map((item) => item.id);
    this.store.dispatch({ type: 'tasks/reorder', orderedIds });
  }

  private syncActiveTask(): void {
    const state = this.store.getState();
    const active = state.activeTaskId ? state.tasks.find((item) => item.id === state.activeTaskId) : undefined;
    if (active && !active.completed) {
      return;
    }
    const next = state.tasks.find((item) => !item.completed);
    this.store.dispatch({ type: 'tasks/set-active', id: next ? next.id : null });
  }
}
