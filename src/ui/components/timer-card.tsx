'use client';

import { clsx } from 'clsx';
import { FiPlay, FiPause, FiRotateCcw, FiSettings, FiMaximize2 } from 'react-icons/fi';
import { TIMER_MODES } from '../../domain/entities/timer';
import type { TimerMode } from '../../domain/entities/timer';
import { useAppSelector, useAppServices } from '../context/app-context';
import { useTimerController } from '../hooks/use-timer-controller';
import { Button } from './primitives/button';

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

interface TimerCardProps {
  readonly onOpenSettings: () => void;
  readonly variant?: 'default' | 'focused';
}

export const TimerCard = ({ onOpenSettings, variant = 'default' }: TimerCardProps) => {
  const { timer } = useAppServices();
  useTimerController();
  const timerState = useAppSelector((state) => state.timer.state);
  const durations = useAppSelector((state) => state.timer.config.durations);
  const preferences = useAppSelector((state) => state.timer.config.preferences);
  const stats = useAppSelector((state) => state.stats.sessionsToday);
  const activeTaskId = useAppSelector((state) => state.activeTaskId);
  const activeTask = useAppSelector((state) => state.tasks.find((task) => task.id === activeTaskId) ?? null);

  const handleModeChange = (mode: TimerMode) => {
    timer.switchMode(mode);
  };

  return (
    <section
      className={clsx(
        'flex flex-1 flex-col gap-6 rounded-lg border border-subtle bg-surface-card shadow-elevated backdrop-blur-xl',
        variant === 'focused' ? 'p-8' : 'p-6',
      )}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Pomodoro</p>
          <h2 className={clsx('text-2xl font-semibold text-primary', variant === 'focused' && 'text-3xl')}>
            Stay in the zone
          </h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<FiSettings className="h-5 w-5" />}
          onClick={onOpenSettings}
          className="w-full sm:w-auto"
        >
          Settings
        </Button>
      </header>
      <div className="flex items-center gap-2 rounded-lg border border-subtle bg-surface-overlay-soft p-2 text-sm text-muted">
        {TIMER_MODES.map((mode) => {
          const isActive = timerState.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={clsx(
                'flex-1 rounded-lg px-4 py-2 font-medium transition-colors',
                isActive
                  ? 'bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]'
                  : 'text-muted hover:text-primary hover:bg-surface-card',
              )}
            >
              {MODE_LABELS[mode]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div
          className={clsx(
            'font-semibold leading-none tracking-tight text-primary',
            variant === 'focused'
              ? 'text-[4.5rem] sm:text-[5rem]'
              : 'text-[3.5rem] sm:text-[4rem] lg:text-[4.5rem]',
          )}
        >
          {formatTime(timerState.remainingMs)}
        </div>
        <div className="flex flex-col items-center gap-1 text-sm text-muted">
          <span>
            {timerState.mode === 'focus' ? 'Deep work session' : 'Recharge moment'} · Today: {stats} sessions
          </span>
          <span className="text-xs text-muted">
            {activeTask ? (
              <>
                Focusing on{' '}
                <span className="font-medium text-primary">
                  {activeTask.title}
                </span>
              </>
            ) : (
              'No active task selected'
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Button
          type="button"
          size="lg"
          onClick={() => (timerState.isRunning ? timer.pause() : timer.start())}
          icon={timerState.isRunning ? <FiPause className="h-6 w-6" /> : <FiPlay className="h-6 w-6" />}
        >
          {timerState.isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={<FiRotateCcw className="h-5 w-5" />}
          onClick={() => timer.reset()}
        >
          Reset
        </Button>
      </div>
      <footer className="rounded-lg border border-subtle bg-surface-overlay-soft p-4 text-sm text-muted">
        <p className="font-medium text-primary">Quick glance</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
          <div>
            <p className="text-muted">Focus length</p>
            <p className="text-primary">{durations.focus} min</p>
          </div>
          <div>
            <p className="text-muted">Break lengths</p>
            <p className="text-primary">{durations.shortBreak} / {durations.longBreak} min</p>
          </div>
          <div>
            <p className="text-muted">Auto-start focus</p>
            <p className="text-primary">{preferences.autoStartFocus ? 'On' : 'Off'}</p>
          </div>
          <div>
            <p className="text-muted">Auto-start breaks</p>
            <p className="text-primary">{preferences.autoStartBreaks ? 'On' : 'Off'}</p>
          </div>
        </div>
      </footer>
    </section>
  );
};

interface TimerMiniCardProps {
  readonly onOpenSettings: () => void;
  readonly onExpand: (mode: 'split' | 'focused') => void;
}

export const TimerMiniCard = ({ onOpenSettings, onExpand }: TimerMiniCardProps) => {
  const { timer } = useAppServices();
  useTimerController();
  const timerState = useAppSelector((state) => state.timer.state);
  const activeTaskTitle = useAppSelector((state) => {
    const task = state.tasks.find((item) => item.id === state.activeTaskId);
    return task ? task.title : null;
  });

  return (
    <section className="w-72 rounded-2xl border border-subtle bg-surface-card p-5 shadow-elevated backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pomodoro</p>
          <p className="text-3xl font-semibold text-primary">{formatTime(timerState.remainingMs)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Open settings"
          >
            <FiSettings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onExpand('focused')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Expand timer"
          >
            <FiMaximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (timerState.isRunning ? timer.pause() : timer.start())}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[0_10px_24px_rgba(78,207,255,0.35)] transition hover:bg-[color:var(--accent-solid-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]"
          aria-label={timerState.isRunning ? 'Pause timer' : 'Start timer'}
        >
          {timerState.isRunning ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => timer.reset()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]"
          aria-label="Reset timer"
        >
          <FiRotateCcw className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-4 truncate text-xs text-muted">
        {activeTaskTitle ? `Focus: ${activeTaskTitle}` : 'No active task selected'}
      </p>
    </section>
  );
};
