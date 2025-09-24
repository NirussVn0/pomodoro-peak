'use client';

import { clsx } from 'clsx';
import { PlayIcon, PauseIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { TimerMode } from '../../domain/entities/timer';
import { TIMER_MODES } from '../../domain/entities/timer';
import { useAppSelector, useAppServices } from '../context/app-context';
import { useTimerController } from '../hooks/use-timer-controller';

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
    <section className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pomodoro</p>
          <h2 className="text-2xl font-semibold text-white">Stay in the zone</h2>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          Settings
        </button>
      </header>
      <div className="flex items-center gap-2 rounded-full bg-white/10 p-2 text-sm text-slate-200">
        {TIMER_MODES.map((mode) => {
          const isActive = timerState.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={clsx(
                'flex-1 rounded-full px-4 py-2 transition',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/40'
                  : 'text-slate-300 hover:text-white',
              )}
            >
              {MODE_LABELS[mode]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="text-[4.5rem] font-semibold leading-none tracking-tight text-white">
          {formatTime(timerState.remainingMs)}
        </div>
        <p className="text-sm text-slate-400">
          {timerState.mode === 'focus' ? 'Deep work session' : 'Recharge moment'} · Today: {stats} sessions
        </p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => (timerState.isRunning ? timer.pause() : timer.start())}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:from-indigo-400 hover:to-purple-400"
        >
          {timerState.isRunning ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
          {timerState.isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => timer.reset()}
          className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Reset
        </button>
      </div>
      <footer className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Quick glance</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400">Focus length</p>
            <p className="text-white">{durations.focus} min</p>
          </div>
          <div>
            <p className="text-slate-400">Break lengths</p>
            <p className="text-white">{durations.shortBreak} / {durations.longBreak} min</p>
          </div>
          <div>
            <p className="text-slate-400">Auto-start focus</p>
            <p className="text-white">{preferences.autoStartFocus ? 'On' : 'Off'}</p>
          </div>
          <div>
            <p className="text-slate-400">Auto-start breaks</p>
            <p className="text-white">{preferences.autoStartBreaks ? 'On' : 'Off'}</p>
          </div>
        </div>
      </footer>
    </section>
  );
};
