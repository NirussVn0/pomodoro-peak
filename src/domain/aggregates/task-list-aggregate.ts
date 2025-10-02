import type { SubTask, Task, TaskTag } from '../entities/task';

export class TaskListAggregate {
  private constructor(private readonly tasks: readonly Task[]) {}

  static from(tasks: readonly Task[]): TaskListAggregate {
    return new TaskListAggregate(tasks);
  }

  toArray(): readonly Task[] {
    return this.tasks;
  }

  add(task: Task): TaskListAggregate {
    const next = [...this.tasks, task].sort((a, b) => a.order - b.order);
    return new TaskListAggregate(next);
  }

  update(id: string, update: Partial<Omit<Task, 'id' | 'subtasks' | 'tags'>> & {
    readonly subtasks?: readonly SubTask[];
    readonly tags?: readonly TaskTag[];
  }): TaskListAggregate {
    const next = this.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...update,
            subtasks: update.subtasks ?? task.subtasks,
            tags: update.tags ?? task.tags,
          }
        : task,
    );
    return new TaskListAggregate(next);
  }

  remove(id: string): TaskListAggregate {
    const next = this.tasks.filter((task) => task.id !== id);
    return new TaskListAggregate(next);
  }

  reorder(orderedIds: readonly string[]): TaskListAggregate {
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => orderMap.set(id, index));
    const next = this.tasks
      .map((task) => ({ ...task, order: orderMap.get(task.id) ?? task.order }))
      .slice()
      .sort((a, b) => a.order - b.order);
    return new TaskListAggregate(next);
  }

  updateSubtask(taskId: string, subtask: SubTask): TaskListAggregate {
    const next = this.tasks.map((task) =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.map((s) => (s.id === subtask.id ? subtask : s)) }
        : task,
    );
    return new TaskListAggregate(next);
  }

  removeSubtask(taskId: string, subtaskId: string): TaskListAggregate {
    const next = this.tasks.map((task) =>
      task.id === taskId ? { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) } : task,
    );
    return new TaskListAggregate(next);
  }

  replaceSubtasks(taskId: string, subtasks: readonly SubTask[]): TaskListAggregate {
    const next = this.tasks.map((task) => (task.id === taskId ? { ...task, subtasks: [...subtasks] } : task));
    return new TaskListAggregate(next);
  }
}

