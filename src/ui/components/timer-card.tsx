'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiSettings, FiMaximize2, FiSkipForward } from 'react-icons/fi';
import { cycleMode } from '../../application/state/app-reducer';
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
  readonly variant?: 'default' | 'maximal';
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
  const maximalScale = useAppSelector((state) => state.settings.layout.maximalScale);

  const showDetails = variant !== 'maximal';

  const handleModeChange = (mode: TimerMode) => {
    timer.switchMode(mode);
  };

  const totalMs = durations[timerState.mode] * 60 * 1000;
  const progress = totalMs > 0 ? 1 - Math.max(0, Math.min(timerState.remainingMs, totalMs)) / totalMs : 0;

  const handleSkip = () => {
    const nextMode = cycleMode(timerState.mode);
    timer.switchMode(nextMode);
    const shouldAutoStart = nextMode === 'focus' ? preferences.autoStartFocus : preferences.autoStartBreaks;
    if (shouldAutoStart) {
      timer.start();
    }
  };

  return (
    <section
      className={clsx(
        'flex flex-1 flex-col gap-6 rounded-3xl border border-subtle bg-surface-card shadow-elevated backdrop-blur-xl',
        showDetails ? 'p-6' : 'mx-auto w-full max-w-3xl items-center justify-center border-white/15 bg-white/5/80 p-12 text-white',
      )}
    >
      <header
        className={clsx(
          'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
          showDetails ? '' : 'w-full items-center justify-center text-center sm:flex-col',
        )}
      >
        <div className={clsx(showDetails ? '' : 'space-y-1')}>
          <p className={clsx('text-sm uppercase tracking-[0.2em] text-muted', showDetails ? '' : 'text-white/60')}>
            Pomodoro
          </p>
          <h2
            className={clsx(
              'text-2xl font-semibold text-primary',
              showDetails ? '' : 'text-4xl tracking-tight text-white',
            )}
          >
            Stay in the zone
          </h2>
        </div>
        {showDetails ? (
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
        ) : null}
      </header>
      {showDetails ? (
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
      ) : null}
      <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
        {showDetails ? (
          <div className="text-[3.5rem] font-semibold leading-none tracking-tight text-primary sm:text-[4rem] lg:text-[4.5rem]">
            {formatTime(timerState.remainingMs)}
          </div>
        ) : (
          <SquareProgressFrame progress={progress} scale={maximalScale}>
            <div className="text-[5rem] font-semibold leading-none tracking-tight text-white sm:text-[5.5rem]">
              {formatTime(timerState.remainingMs)}
            </div>
          </SquareProgressFrame>
        )}
        {showDetails ? (
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
        ) : null}
      </div>
      <div className={clsx('flex flex-wrap items-center justify-center gap-3 sm:gap-4', showDetails ? '' : 'gap-4')}>
        <Button
          type="button"
          size="lg"
          onClick={() => (timerState.isRunning ? timer.pause() : timer.start())}
          icon={timerState.isRunning ? <FiPause className="h-6 w-6" /> : <FiPlay className="h-6 w-6" />}
          className={showDetails ? '' : 'px-10 text-lg'}
        >
          {timerState.isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={<FiSkipForward className="h-5 w-5" />}
          onClick={handleSkip}
          className={showDetails ? '' : 'border-white/30 bg-white/10 text-white hover:bg-white/20'}
        >
          Skip
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={<FiRotateCcw className="h-5 w-5" />}
          onClick={() => timer.reset()}
          className={showDetails ? '' : 'border-white/30 bg-white/10 text-white hover:bg-white/20'}
        >
          Reset
        </Button>
      </div>
      {showDetails ? (
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
      ) : null}
    </section>
  );
};

interface TimerMiniCardProps {
  readonly onOpenSettings?: () => void;
  readonly onExpand?: (mode: 'split' | 'maximal') => void;
}

export const TimerMiniCard = ({ onOpenSettings, onExpand }: TimerMiniCardProps) => {
  const { timer } = useAppServices();
  useTimerController();
  const timerState = useAppSelector((state) => state.timer.state);
  const preferences = useAppSelector((state) => state.timer.config.preferences);
  const activeTaskTitle = useAppSelector((state) => {
    const task = state.tasks.find((item) => item.id === state.activeTaskId);
    return task ? task.title : null;
  });

  const handleSkip = () => {
    const nextMode = cycleMode(timerState.mode);
    timer.switchMode(nextMode);
    const shouldAutoStart = nextMode === 'focus' ? preferences.autoStartFocus : preferences.autoStartBreaks;
    if (shouldAutoStart) {
      timer.start();
    }
  };

  return (
    <section className="w-72 rounded-2xl border border-subtle bg-surface-card p-5 shadow-elevated backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pomodoro</p>
          <p className="text-3xl font-semibold text-primary">{formatTime(timerState.remainingMs)}</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
              aria-label="Open settings"
            >
              <FiSettings className="h-4 w-4" />
            </button>
          ) : null}
          {onExpand ? (
            <button
              type="button"
              onClick={() => onExpand('maximal')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
              aria-label="Expand timer"
            >
              <FiMaximize2 className="h-4 w-4" />
            </button>
          ) : null}
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
          onClick={handleSkip}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]"
          aria-label="Skip phase"
        >
          <FiSkipForward className="h-5 w-5" />
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

const SquareProgressFrame = ({ progress, scale, children }: { readonly progress: number; readonly scale: number; readonly children: ReactNode }) => {
  const clamped = Math.min(Math.max(progress, 0), 1) * 3;
  const topFill = Math.min(clamped, 1) * 100;
  const rightFill = Math.min(Math.max(clamped - 1, 0), 1) * 100;
  const leftFill = Math.min(Math.max(clamped - 2, 0), 1) * 100;
  return (
    <div className="relative flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
      <div className="absolute inset-0 rounded-[32px] border border-white/15" />
      <div className="absolute left-0 top-0 h-1.5 rounded-full bg-[color:var(--accent-solid)]" style={{ width: `${topFill}%` }} />
      <div className="absolute right-0 top-0 w-1.5 rounded-full bg-[color:var(--accent-solid)]" style={{ height: `${rightFill}%` }} />
      <div className="absolute left-0 bottom-0 w-1.5 rounded-full bg-[color:var(--accent-solid)]" style={{ height: `${leftFill}%` }} />
      <div className="relative flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-[color:var(--surface-card)]/70 px-12 py-10 shadow-[0_35px_120px_rgba(10,10,45,0.45)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
};
