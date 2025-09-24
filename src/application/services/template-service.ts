import type { AppStore } from '../state/app-store';
import type { UuidPort } from '../ports/uuid-port';
import type { TimePort } from '../ports/time-port';
import type { TaskTemplate, TaskTemplateItem } from '../../domain/entities/task';

export class TemplateService {
  constructor(
    private readonly store: AppStore,
    private readonly uuid: UuidPort,
    private readonly time: TimePort,
  ) {}

  createTemplate(name: string, items: readonly TaskTemplateItem[]): TaskTemplate | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }
    const template: TaskTemplate = {
      id: this.uuid.generate(),
      name: trimmed,
      items: items.map((item) => ({
        title: item.title.trim(),
        tags: item.tags.map((tag) => tag.trim()).filter(Boolean),
        subtasks: item.subtasks.map((subtask) => subtask.trim()).filter(Boolean),
      })),
      createdAt: this.time.now(),
    };
    this.store.dispatch({ type: 'templates/upsert', template });
    return template;
  }

  updateTemplate(template: TaskTemplate): void {
    this.store.dispatch({ type: 'templates/upsert', template });
  }

  removeTemplate(id: string): void {
    this.store.dispatch({ type: 'templates/remove', id });
  }

  createFromCurrentTasks(name: string): TaskTemplate | null {
    const state = this.store.getState();
    const items = state.tasks
      .sort((a, b) => a.order - b.order)
      .map((task) => ({
        title: task.title,
        tags: task.tags.map((tag) => tag.label),
        subtasks: task.subtasks.map((subtask) => subtask.title),
      }));
    return this.createTemplate(name, items);
  }
}
