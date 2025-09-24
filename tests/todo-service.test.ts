import { describe, expect, it } from 'vitest';
import { createAppStore } from '@/application/state/app-store';
import { TodoService } from '@/application/services/todo-service';
import type { UuidPort } from '@/application/ports/uuid-port';
import type { TimePort } from '@/application/ports/time-port';
import type { TaskTemplate } from '@/domain/entities/task';

const createUuid = (): UuidPort => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  let index = 0;
  return {
    generate: () => ids[index++ % ids.length] + index,
  };
};

describe('TodoService', () => {
  it('applies templates by creating new tasks with generated identifiers', () => {
    const store = createAppStore();
    const uuid = createUuid();
    const time: TimePort = { now: () => 1000 };
    const service = new TodoService(store, uuid, time);

    const template: TaskTemplate = {
      id: 't-1',
      name: 'Quick start',
      createdAt: 0,
      items: [
        { title: 'Review goals', tags: ['focus'], subtasks: ['Check inbox', 'Update board'] },
        { title: 'Start deep work', tags: [], subtasks: [] },
      ],
    };

    service.applyTemplate(template);

    const tasks = store.getState().tasks;
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Review goals');
    expect(tasks[0].subtasks).toHaveLength(2);
    expect(tasks[1].title).toBe('Start deep work');
    expect(new Set(tasks.map((task) => task.id)).size).toBe(2);
  });
});
