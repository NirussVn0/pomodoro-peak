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

export interface AppSettings {
  readonly theme: ThemePreference;
  readonly background: BackgroundSettings;
  readonly notification: NotificationPreferences;
  readonly shortcuts: ShortcutConfig;
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
};
