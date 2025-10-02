import type {
  TimerConfig,
  TimerDurations,
  TimerMode,
  TimerPreferences,
  TimerSnapshot,
  TimerState,
} from '../entities/timer';

export class TimerAggregate {
  private constructor(private readonly snapshot: TimerSnapshot) {}

  static fromSnapshot(snapshot: TimerSnapshot): TimerAggregate {
    return new TimerAggregate(snapshot);
  }

  toSnapshot(): TimerSnapshot {
    return this.snapshot;
  }

  start(timestamp: number): TimerAggregate {
    if (this.snapshot.state.isRunning) {
      return this;
    }
    const nextState: TimerState = {
      ...this.snapshot.state,
      isRunning: true,
      lastStartedAt: timestamp,
    };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  pause(): TimerAggregate {
    if (!this.snapshot.state.isRunning) {
      return this;
    }
    const nextState: TimerState = {
      ...this.snapshot.state,
      isRunning: false,
      lastStartedAt: undefined,
    };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  reset(timestamp: number, mode?: TimerMode): TimerAggregate {
    const nextMode = mode ?? this.snapshot.state.mode;
    const duration = this.snapshot.config.durations[nextMode];
    const nextState: TimerState = {
      mode: nextMode,
      isRunning: false,
      remainingMs: duration * 60 * 1000,
      lastStartedAt: undefined,
    };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  setMode(timestamp: number, mode: TimerMode): TimerAggregate {
    const duration = this.snapshot.config.durations[mode];
    const nextState: TimerState = {
      mode,
      isRunning: false,
      remainingMs: duration * 60 * 1000,
      lastStartedAt: undefined,
    };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  tick(deltaMs: number): TimerAggregate {
    const nextRemaining = Math.max(0, this.snapshot.state.remainingMs - deltaMs);
    if (nextRemaining === this.snapshot.state.remainingMs) {
      return this;
    }
    const nextState: TimerState = { ...this.snapshot.state, remainingMs: nextRemaining };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  applyRemaining(remainingMs: number): TimerAggregate {
    const nextState: TimerState = { ...this.snapshot.state, remainingMs };
    return new TimerAggregate({ ...this.snapshot, state: nextState });
  }

  setDurations(durations: TimerDurations): TimerAggregate {
    const mode = this.snapshot.state.mode;
    const cappedRemaining = Math.min(this.snapshot.state.remainingMs, durations[mode] * 60 * 1000);
    const nextConfig: TimerConfig = {
      ...this.snapshot.config,
      durations,
    };
    const nextState: TimerState = { ...this.snapshot.state, remainingMs: cappedRemaining };
    return new TimerAggregate({ config: nextConfig, state: nextState });
  }

  setPreferences(preferences: Partial<TimerPreferences>): TimerAggregate {
    const nextConfig: TimerConfig = {
      ...this.snapshot.config,
      preferences: {
        ...this.snapshot.config.preferences,
        ...preferences,
      },
    };
    return new TimerAggregate({ ...this.snapshot, config: nextConfig });
  }
}

