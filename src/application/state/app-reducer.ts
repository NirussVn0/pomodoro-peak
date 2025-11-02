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
import type { AppSettings, LayoutSettings } from '../../domain/value-objects/settings';
import { DEFAULT_APP_SETTINGS } from '../../domain/value-objects/settings';
import type { BackgroundSettings } from '../../domain/value-objects/background';
import { TimerAggregate } from '../../domain/aggregates/timer-aggregate';
import { TaskListAggregate } from '../../domain/aggregates/task-list-aggregate';

export interface AppState {
  readonly timer: TimerSnapshot;
  readonly stats: TimerStats;
  readonly tasks: readonly Task[];
  readonly templates: readonly TaskTemplate[];
  readonly settings: AppSettings;
  readonly activeTaskId: string | null;
  readonly commitLog: readonly {
    readonly id: string;
    readonly taskId: string;
    readonly targetId: string;
    readonly target: 'task' | 'subtask';
    readonly timestamp: number;
  }[];
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
  activeTaskId: null,
  commitLog: [],
});

type TaskUpdate = Partial<Omit<Task, 'id' | 'subtasks' | 'tags'>> & {
  readonly subtasks?: readonly SubTask[];
  readonly tags?: Task['tags'];
};

type PartialLayoutSettings = Partial<LayoutSettings>;

type PartialAppSettings = Partial<Omit<AppSettings, 'layout'>> & {
  readonly layout?: PartialLayoutSettings;
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
  | { readonly type: 'tasks/set-active'; readonly id: string | null }
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
  | { readonly type: 'settings/update'; readonly settings: PartialAppSettings }
  | { readonly type: 'settings/update-background'; readonly background: BackgroundSettings }
  | { readonly type: 'templates/upsert'; readonly template: TaskTemplate }
  | { readonly type: 'templates/remove'; readonly id: string }
  | {
      readonly type: 'commits/log';
      readonly entry: {
        readonly id: string;
        readonly taskId: string;
        readonly targetId: string;
        readonly target: 'task' | 'subtask';
        readonly timestamp: number;
      };
    };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'timer/start': {
      const aggregate = TimerAggregate.fromSnapshot(state.timer).start(action.timestamp);
      return { ...state, timer: aggregate.toSnapshot() };
    }
    case 'timer/pause':
      return { ...state, timer: TimerAggregate.fromSnapshot(state.timer).pause().toSnapshot() };
    case 'timer/reset': {
      const aggregate = TimerAggregate.fromSnapshot(state.timer).reset(action.timestamp, action.mode);
      return { ...state, timer: aggregate.toSnapshot() };
    }
    case 'timer/set-mode': {
      const aggregate = TimerAggregate.fromSnapshot(state.timer).setMode(action.timestamp, action.mode);
      return { ...state, timer: aggregate.toSnapshot() };
    }
    case 'timer/tick': {
      const aggregate = TimerAggregate.fromSnapshot(state.timer).tick(action.deltaMs);
      return { ...state, timer: aggregate.toSnapshot() };
    }
    case 'timer/apply-remaining':
      return {
        ...state,
        timer: TimerAggregate.fromSnapshot(state.timer).applyRemaining(action.remainingMs).toSnapshot(),
      };
    case 'timer/set-durations': {
      return {
        ...state,
        timer: TimerAggregate.fromSnapshot(state.timer).setDurations(action.durations).toSnapshot(),
      };
    }
    case 'timer/set-preferences':
      return {
        ...state,
        timer: TimerAggregate.fromSnapshot(state.timer).setPreferences(action.preferences).toSnapshot(),
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
      return { ...state, tasks: TaskListAggregate.from(state.tasks).add(action.task).toArray() };
    case 'tasks/update':
      return {
        ...state,
        tasks: TaskListAggregate.from(state.tasks).update(action.id, action.update).toArray(),
        activeTaskId:
          state.activeTaskId === action.id && action.update.completed === true ? null : state.activeTaskId,
      };
    case 'tasks/remove':
      return {
        ...state,
        tasks: TaskListAggregate.from(state.tasks).remove(action.id).toArray(),
        activeTaskId: state.activeTaskId === action.id ? null : state.activeTaskId,
      };
    case 'tasks/reorder':
      return { ...state, tasks: TaskListAggregate.from(state.tasks).reorder(action.orderedIds).toArray() };
    case 'tasks/apply-template':
      return {
        ...state,
        tasks: [...state.tasks, ...action.tasks].sort((a, b) => a.order - b.order),
      };
    case 'tasks/update-subtask':
      return {
        ...state,
        tasks: TaskListAggregate.from(state.tasks).updateSubtask(action.taskId, action.subtask).toArray(),
      };
    case 'tasks/remove-subtask':
      return {
        ...state,
        tasks: TaskListAggregate.from(state.tasks).removeSubtask(action.taskId, action.subtaskId).toArray(),
      };
    case 'tasks/replace-subtasks':
      return {
        ...state,
        tasks: TaskListAggregate.from(state.tasks).replaceSubtasks(action.taskId, action.subtasks).toArray(),
      };
    case 'tasks/set-active':
      return { ...state, activeTaskId: action.id };
    case 'settings/update':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
          background: action.settings.background
            ? { ...state.settings.background, ...action.settings.background }
            : state.settings.background,
          notification: action.settings.notification
            ? { ...state.settings.notification, ...action.settings.notification }
            : state.settings.notification,
          shortcuts: action.settings.shortcuts
            ? { ...state.settings.shortcuts, ...action.settings.shortcuts }
            : state.settings.shortcuts,
          tasks: action.settings.tasks
            ? { ...state.settings.tasks, ...action.settings.tasks }
            : state.settings.tasks,
          layout: action.settings.layout
            ? { ...state.settings.layout, ...action.settings.layout }
            : state.settings.layout,
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
    case 'commits/log':
      return {
        ...state,
        commitLog: [...state.commitLog, action.entry],
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
