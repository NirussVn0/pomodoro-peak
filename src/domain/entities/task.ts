export interface SubTask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly completedAt?: number;
}

export interface TaskTag {
  readonly id: string;
  readonly label: string;
}

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly completedAt?: number;
  readonly subtasks: readonly SubTask[];
  readonly tags: readonly TaskTag[];
  readonly createdAt: number;
  readonly order: number;
}

export interface TaskTemplateItem {
  readonly title: string;
  readonly tags: readonly string[];
  readonly subtasks: readonly string[];
}

export interface TaskTemplate {
  readonly id: string;
  readonly name: string;
  readonly items: readonly TaskTemplateItem[];
  readonly createdAt: number;
}

export const createEmptyTask = (params: {
  id: string;
  title: string;
  order: number;
  timestamp: number;
}): Task => ({
  id: params.id,
  title: params.title,
  completed: false,
  completedAt: undefined,
  subtasks: [],
  tags: [],
  createdAt: params.timestamp,
  order: params.order,
});

export const createSubtask = (params: { id: string; title: string }): SubTask => ({
  id: params.id,
  title: params.title,
  completed: false,
  completedAt: undefined,
});

export const DEFAULT_TEMPLATES: readonly TaskTemplate[] = [
  {
    id: 'template-focus-start',
    name: 'Focus Sprint',
    createdAt: Date.now(),
    items: [
      {
        title: 'Plan sprint goals',
        tags: ['planning'],
        subtasks: ['Outline priorities', 'Clarify blockers'],
      },
      {
        title: 'Deep work block',
        tags: ['focus'],
        subtasks: ['Silence notifications', 'Set timer'],
      },
    ],
  },
];
