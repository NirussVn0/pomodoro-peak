import type { BackgroundSettings } from './background';
import type { TimerConfig, TimerStats } from '../entities/timer';
import type { TaskTemplate } from '../entities/task';

export type ThemePreference = 'light' | 'dark';

export interface NotificationPreferences {
  readonly desktop: boolean;
}

export interface ShortcutConfig {
  readonly enabled: boolean;
}

export type TimerViewMode = 'split' | 'maximal' | 'mini';

export interface LayoutSettings {
  readonly timerView: TimerViewMode;
  readonly maximalClockScale: number;
}

export interface TaskSettings {
  readonly autoCompleteOnFocusEnd: boolean;
  readonly autoSortCompleted: boolean;
}

export interface AppSettings {
  readonly theme: ThemePreference;
  readonly background: BackgroundSettings;
  readonly notification: NotificationPreferences;
  readonly shortcuts: ShortcutConfig;
  readonly tasks: TaskSettings;
  readonly layout: LayoutSettings;
}

export interface AppSnapshot {
  readonly timer: TimerConfig;
  readonly stats: TimerStats;
  readonly settings: AppSettings;
  readonly templates: readonly TaskTemplate[];
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  desktop: false,
};

export const DEFAULT_SHORTCUT_CONFIG: ShortcutConfig = {
  enabled: true,
};

export const DEFAULT_TASK_SETTINGS: TaskSettings = {
  autoCompleteOnFocusEnd: true,
  autoSortCompleted: true,
};

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  timerView: 'split',
  maximalClockScale: 1,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  background: {
    kind: 'solid',
    value: '#141824',
    blur: 0,
    opacity: 1,
  },
  notification: DEFAULT_NOTIFICATION_PREFERENCES,
  shortcuts: DEFAULT_SHORTCUT_CONFIG,
  tasks: DEFAULT_TASK_SETTINGS,
  layout: DEFAULT_LAYOUT_SETTINGS,
};

export type SettingsUpdate = Partial<Omit<AppSettings, 'tasks' | 'layout'>> & {
  readonly tasks?: Partial<TaskSettings>;
  readonly layout?: Partial<LayoutSettings>;
};
