'use client';

import { clsx } from 'clsx';
import { PlayIcon, PauseIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { TimerMode } from '../../domain/entities/timer';
import { TIMER_MODES } from '../../domain/entities/timer';
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
}

export const TimerCard = ({ onOpenSettings }: TimerCardProps) => {
  const { timer } = useAppServices();
  useTimerController();
  const timerState = useAppSelector((state) => state.timer.state);
  const durations = useAppSelector((state) => state.timer.config.durations);
  const preferences = useAppSelector((state) => state.timer.config.preferences);
  const stats = useAppSelector((state) => state.stats.sessionsToday);

  const handleModeChange = (mode: TimerMode) => {
    timer.switchMode(mode);
  };

  return (
    <section className="flex flex-1 flex-col gap-6 rounded-lg border border-subtle bg-surface-card p-6 shadow-elevated backdrop-blur-xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Pomodoro</p>
          <h2 className="text-2xl font-semibold text-primary">Stay in the zone</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Cog6ToothIcon className="h-5 w-5" />}
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
        <div className="text-[3.5rem] font-semibold leading-none tracking-tight text-primary sm:text-[4rem] lg:text-[4.5rem]">
          {formatTime(timerState.remainingMs)}
        </div>
        <p className="text-sm text-muted">
          {timerState.mode === 'focus' ? 'Deep work session' : 'Recharge moment'} · Today: {stats} sessions
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Button
          type="button"
          size="lg"
          onClick={() => (timerState.isRunning ? timer.pause() : timer.start())}
          icon={timerState.isRunning ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
        >
          {timerState.isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={<ArrowPathIcon className="h-5 w-5" />}
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
