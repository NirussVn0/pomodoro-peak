import type { AppStore } from '../state/app-store';
import type { TimerDurations, TimerMode, TimerPreferences } from '../../domain/entities/timer';
import { cycleMode } from '../state/app-reducer';
import type { AudioPort } from '../ports/audio-port';
import type { NotificationPort } from '../ports/notification-port';
import type { TimePort } from '../ports/time-port';

const COMPLETION_NOTIFICATION_TITLE = 'Session complete!';

export class TimerService {
  private lastTickAt?: number;

  constructor(
    private readonly store: AppStore,
    private readonly audio: AudioPort,
    private readonly notifications: NotificationPort,
    private readonly time: TimePort,
  ) {}

  start(): void {
    const state = this.store.getState();
    if (state.timer.state.isRunning) {
      return;
    }
    const now = this.time.now();
    this.lastTickAt = now;
    this.store.dispatch({ type: 'timer/start', timestamp: now });
  }

  pause(): void {
    const state = this.store.getState();
    if (!state.timer.state.isRunning) {
      return;
    }
    this.store.dispatch({ type: 'timer/pause' });
    this.lastTickAt = undefined;
  }

  reset(mode?: TimerMode): void {
    const now = this.time.now();
    this.store.dispatch({ type: 'timer/reset', timestamp: now, mode });
    this.lastTickAt = undefined;
  }

  skip(): void {
    const state = this.store.getState();
    const currentMode = state.timer.state.mode;
    const nextMode = cycleMode(currentMode);
    const now = this.time.now();
    this.store.dispatch({ type: 'timer/set-mode', timestamp: now, mode: nextMode });
    this.lastTickAt = undefined;
    const prefs = this.store.getState().timer.config.preferences;
    const shouldAutoStart = nextMode === 'focus' ? prefs.autoStartFocus : prefs.autoStartBreaks;
    if (shouldAutoStart) {
      this.start();
    }
  }

  switchMode(mode: TimerMode): void {
    const now = this.time.now();
    this.store.dispatch({ type: 'timer/set-mode', timestamp: now, mode });
    this.lastTickAt = undefined;
  }

  updateDurations(durations: TimerDurations): void {
    this.store.dispatch({ type: 'timer/set-durations', durations });
  }

  updatePreferences(preferences: Partial<TimerPreferences>): void {
    this.store.dispatch({ type: 'timer/set-preferences', preferences });
  }

  tick(): void {
    const state = this.store.getState();
    if (!state.timer.state.isRunning) {
      this.lastTickAt = undefined;
      return;
    }
    const now = this.time.now();
    const anchor = this.lastTickAt ?? state.timer.state.lastStartedAt ?? now;
    const delta = Math.max(0, now - anchor);
    if (delta <= 0) {
      return;
    }
    this.lastTickAt = now;
    this.store.dispatch({ type: 'timer/tick', deltaMs: delta });
    const updated = this.store.getState();
    const remaining = updated.timer.state.remainingMs;
    if (remaining === 0) {
      this.handleCompletion(now);
      return;
    }
    if (updated.timer.config.preferences.tickSound) {
      this.audio.playTick();
    }
  }

  private handleCompletion(timestamp: number): void {
    const state = this.store.getState();
    const currentMode = state.timer.state.mode;
    if (currentMode === 'focus' && state.settings.tasks.autoCompleteOnFocusEnd && state.activeTaskId) {
      const task = state.tasks.find((item) => item.id === state.activeTaskId);
      if (task && !task.completed) {
        const subtasks = task.subtasks.map((subtask) => ({ ...subtask, completed: true }));
        this.store.dispatch({
          type: 'tasks/update',
          id: task.id,
          update: { completed: true, subtasks },
        });
        if (state.settings.tasks.autoSortCompleted) {
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
        const nextState = this.store.getState();
        const nextActive = nextState.tasks.find((item) => !item.completed);
        this.store.dispatch({ type: 'tasks/set-active', id: nextActive ? nextActive.id : null });
      }
    }
    this.store.dispatch({ type: 'timer/pause' });
    this.lastTickAt = undefined;
    this.store.dispatch({ type: 'stats/increment-session', timestamp });
    const prefs = state.timer.config.preferences;
    if (prefs.alarmSound) {
      this.audio.playAlarm();
    }
    if (state.settings.notification.desktop) {
      void this.notifications.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.notifications.notify(COMPLETION_NOTIFICATION_TITLE, {
            body: `Your ${currentMode.replace(/([A-Z])/g, ' $1')} session is done.`,
          });
        }
      });
    }
    const nextMode = cycleMode(currentMode);
    this.store.dispatch({ type: 'timer/set-mode', timestamp, mode: nextMode });
    const shouldAutoStart = nextMode === 'focus' ? prefs.autoStartFocus : prefs.autoStartBreaks;
    if (shouldAutoStart) {
      this.start();
    }
  }
}
