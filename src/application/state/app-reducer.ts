import type {
  TimerMode,
  TimerSnapshot,
  TimerDurations,
  TimerPreferences,
  TimerStats,
} from '../../domain/entities/timer';
import {
  DEFAULT_TIMER_SNAPSHOT,
  DEFAULT_TIMER_STATS,
  TIMER_MODES,
} from '../../domain/entities/timer';
import type { Task, SubTask, TaskTemplate } from '../../domain/entities/task';
import { DEFAULT_TEMPLATES, createEmptyTask, createSubtask } from '../../domain/entities/task';
import type { AppSettings } from '../../domain/value-objects/settings';
import { DEFAULT_APP_SETTINGS } from '../../domain/value-objects/settings';
import type { BackgroundSettings } from '../../domain/value-objects/background';

export interface AppState {
  readonly timer: TimerSnapshot;
  readonly stats: TimerStats;
  readonly tasks: readonly Task[];
  readonly templates: readonly TaskTemplate[];
  readonly settings: AppSettings;
}

export const defaultAppState = (): AppState => ({
  timer: DEFAULT_TIMER_SNAPSHOT,
  stats: { ...DEFAULT_TIMER_STATS, lastCompletedAt: undefined },
  tasks: [],
  templates: DEFAULT_TEMPLATES,
  settings: {
    ...DEFAULT_APP_SETTINGS,
    background: { ...DEFAULT_APP_SETTINGS.background },
  },
});

type TaskUpdate = Partial<Omit<Task, 'id' | 'subtasks' | 'tags'>> & {
  readonly subtasks?: readonly SubTask[];
  readonly tags?: readonly Task['tags'];
};

export type AppAction =
  | { readonly type: 'timer/start'; readonly timestamp: number }
  | { readonly type: 'timer/pause' }
  | { readonly type: 'timer/reset'; readonly timestamp: number; readonly mode?: TimerMode }
  | { readonly type: 'timer/set-mode'; readonly timestamp: number; readonly mode: TimerMode }
  | { readonly type: 'timer/tick'; readonly deltaMs: number }
  | { readonly type: 'timer/set-durations'; readonly durations: TimerDurations }
  | { readonly type: 'timer/set-preferences'; readonly preferences: Partial<TimerPreferences> }
  | { readonly type: 'timer/apply-remaining'; readonly remainingMs: number }
  | { readonly type: 'stats/increment-session'; readonly timestamp: number }
  | { readonly type: 'tasks/add'; readonly task: Task }
  | { readonly type: 'tasks/update'; readonly id: string; readonly update: TaskUpdate }
  | { readonly type: 'tasks/remove'; readonly id: string }
  | { readonly type: 'tasks/reorder'; readonly orderedIds: readonly string[] }
  | { readonly type: 'tasks/apply-template'; readonly tasks: readonly Task[] }
  | {
      readonly type: 'tasks/update-subtask';
      readonly taskId: string;
      readonly subtask: SubTask;
    }
  | {
      readonly type: 'tasks/remove-subtask';
      readonly taskId: string;
      readonly subtaskId: string;
    }
  | {
      readonly type: 'tasks/replace-subtasks';
      readonly taskId: string;
      readonly subtasks: readonly SubTask[];
    }
  | { readonly type: 'settings/update'; readonly settings: Partial<AppSettings> }
  | { readonly type: 'settings/update-background'; readonly background: BackgroundSettings }
  | { readonly type: 'templates/upsert'; readonly template: TaskTemplate }
  | { readonly type: 'templates/remove'; readonly id: string };

const reorderTasks = (tasks: readonly Task[], orderedIds: readonly string[]): readonly Task[] => {
  const orderMap = new Map<string, number>();
  orderedIds.forEach((id, index) => orderMap.set(id, index));
  return tasks
    .map((task) => ({ ...task, order: orderMap.get(task.id) ?? task.order }))
    .slice()
    .sort((a, b) => a.order - b.order);
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'timer/start':
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            ...state.timer.state,
            isRunning: true,
            lastStartedAt: action.timestamp,
          },
        },
      };
    case 'timer/pause':
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            ...state.timer.state,
            isRunning: false,
            lastStartedAt: undefined,
          },
        },
      };
    case 'timer/reset': {
      const mode = action.mode ?? state.timer.state.mode;
      const duration = state.timer.config.durations[mode];
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            mode,
            isRunning: false,
            remainingMs: duration * 60 * 1000,
          },
        },
      };
    }
    case 'timer/set-mode': {
      const duration = state.timer.config.durations[action.mode];
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            mode: action.mode,
            isRunning: false,
            remainingMs: duration * 60 * 1000,
          },
        },
      };
    }
    case 'timer/tick': {
      const nextRemaining = Math.max(0, state.timer.state.remainingMs - action.deltaMs);
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            ...state.timer.state,
            remainingMs: nextRemaining,
          },
        },
      };
    }
    case 'timer/apply-remaining':
      return {
        ...state,
        timer: {
          ...state.timer,
          state: {
            ...state.timer.state,
            remainingMs: action.remainingMs,
          },
        },
      };
    case 'timer/set-durations': {
      const durations = action.durations;
      const mode = state.timer.state.mode;
      const nextRemaining = durations[mode] * 60 * 1000;
      return {
        ...state,
        timer: {
          ...state.timer,
          config: {
            ...state.timer.config,
            durations,
          },
          state: {
            ...state.timer.state,
            remainingMs: Math.min(state.timer.state.remainingMs, nextRemaining),
          },
        },
      };
    }
    case 'timer/set-preferences':
      return {
        ...state,
        timer: {
          ...state.timer,
          config: {
            ...state.timer.config,
            preferences: {
              ...state.timer.config.preferences,
              ...action.preferences,
            },
          },
        },
      };
    case 'stats/increment-session':
      return {
        ...state,
        stats: {
          sessionsToday: state.stats.sessionsToday + 1,
          lastCompletedAt: action.timestamp,
        },
      };
    case 'tasks/add':
      return {
        ...state,
        tasks: [...state.tasks, action.task].sort((a, b) => a.order - b.order),
      };
    case 'tasks/update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                ...action.update,
                subtasks: action.update.subtasks ?? task.subtasks,
                tags: action.update.tags ?? task.tags,
              }
            : task,
        ),
      };
    case 'tasks/remove':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      };
    case 'tasks/reorder':
      return {
        ...state,
        tasks: reorderTasks(state.tasks, action.orderedIds),
      };
    case 'tasks/apply-template':
      return {
        ...state,
        tasks: [...state.tasks, ...action.tasks].sort((a, b) => a.order - b.order),
      };
    case 'tasks/update-subtask':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((sub) => (sub.id === action.subtask.id ? action.subtask : sub)),
              }
            : task,
        ),
      };
    case 'tasks/remove-subtask':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter((sub) => sub.id !== action.subtaskId),
              }
            : task,
        ),
      };
    case 'tasks/replace-subtasks':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                subtasks: [...action.subtasks],
              }
            : task,
        ),
      };
    case 'settings/update':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
          background: action.settings.background ?? state.settings.background,
        },
      };
    case 'settings/update-background':
      return {
        ...state,
        settings: {
          ...state.settings,
          background: action.background,
        },
      };
    case 'templates/upsert': {
      const exists = state.templates.some((template) => template.id === action.template.id);
      const templates = exists
        ? state.templates.map((template) => (template.id === action.template.id ? action.template : template))
        : [...state.templates, action.template];
      return {
        ...state,
        templates,
      };
    }
    case 'templates/remove':
      return {
        ...state,
        templates: state.templates.filter((template) => template.id !== action.id),
      };
    default:
      return state;
  }
};

export const createTaskFromTemplate = (
  templateItem: TaskTemplate['items'][number],
  params: { id: string; order: number; timestamp: number },
): Task => {
  const task = createEmptyTask({ id: params.id, order: params.order, title: templateItem.title, timestamp: params.timestamp });
  const subtasks = templateItem.subtasks.map((title, index) =>
    createSubtask({ id: `${params.id}-sub-${index}`, title }),
  );
  const tags = templateItem.tags.map((label, index) => ({ id: `${params.id}-tag-${index}`, label }));
  return {
    ...task,
    subtasks,
    tags,
  };
};

export const cycleMode = (current: TimerMode): TimerMode => {
  const idx = TIMER_MODES.indexOf(current);
  const next = TIMER_MODES[(idx + 1) % TIMER_MODES.length];
  return next;
};
