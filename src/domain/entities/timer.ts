export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerDurations {
  readonly focus: number; // minutes
  readonly shortBreak: number; // minutes
  readonly longBreak: number; // minutes
}

export interface TimerPreferences {
  readonly autoStartFocus: boolean;
  readonly autoStartBreaks: boolean;
  readonly tickSound: boolean;
  readonly alarmSound: boolean;
}

export interface TimerState {
  readonly mode: TimerMode;
  readonly remainingMs: number;
  readonly isRunning: boolean;
  readonly lastStartedAt?: number;
}

export interface TimerConfig {
  readonly durations: TimerDurations;
  readonly preferences: TimerPreferences;
}

export interface TimerSnapshot {
  readonly state: TimerState;
  readonly config: TimerConfig;
}

export interface TimerStats {
  readonly sessionsToday: number;
  readonly lastCompletedAt?: number;
}

export const TIMER_MODES: readonly TimerMode[] = ['focus', 'shortBreak', 'longBreak'] as const;

export const DEFAULT_TIMER_DURATIONS: TimerDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export const DEFAULT_TIMER_PREFERENCES: TimerPreferences = {
  autoStartBreaks: true,
  autoStartFocus: false,
  tickSound: false,
  alarmSound: true,
};

export const DEFAULT_TIMER_STATE: TimerState = {
  mode: 'focus',
  remainingMs: DEFAULT_TIMER_DURATIONS.focus * 60 * 1000,
  isRunning: false,
};

export const DEFAULT_TIMER_SNAPSHOT: TimerSnapshot = {
  state: DEFAULT_TIMER_STATE,
  config: {
    durations: DEFAULT_TIMER_DURATIONS,
    preferences: DEFAULT_TIMER_PREFERENCES,
  },
};

export const DEFAULT_TIMER_STATS: TimerStats = {
  sessionsToday: 0,
};
