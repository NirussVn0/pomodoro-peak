'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';
import { FiPause, FiPlay, FiRotateCcw } from 'react-icons/fi';
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

const MODE_LABELS: Record<string, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

interface MaximalTimerProps {
  readonly baseSize?: number;
  readonly scaleOverride?: number;
}

export const MaximalTimer = ({ baseSize = 320, scaleOverride }: MaximalTimerProps = {}) => {
  const { timer } = useAppServices();
  useTimerController();
  const timerState = useAppSelector((state) => state.timer.state);
  const durations = useAppSelector((state) => state.timer.config.durations);
  const scaleSetting = useAppSelector((state) => state.settings.layout.maximalClockScale ?? 1);
  const activeTask = useAppSelector((state) =>
    state.tasks.find((task) => task.id === state.activeTaskId) ?? null,
  );

  const metrics = useMemo(() => {
    const strokeWidth = Math.max(12, Math.round(baseSize * 0.05));
    const rawScale = scaleOverride ?? scaleSetting;
    const clampedScale = Math.min(1.5, Math.max(0.7, rawScale));
    const size = Math.round(baseSize * clampedScale);
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const totalMs = durations[timerState.mode] * 60 * 1000;
    const progress =
      totalMs > 0 ? Math.min(1, Math.max(0, 1 - timerState.remainingMs / totalMs)) : 0;
    const dashOffset = circumference * (1 - progress);
    return { size, radius, circumference, strokeWidth, dashOffset };
  }, [baseSize, durations, scaleOverride, scaleSetting, timerState.mode, timerState.remainingMs]);

  const handleToggle = () => {
    if (timerState.isRunning) {
      timer.pause();
    } else {
      timer.start();
    }
  };

  const handleReset = () => {
    timer.reset();
  };

  const modeLabel = MODE_LABELS[timerState.mode] ?? 'Focus';

  return (
    <div className="flex flex-col items-center gap-10">
      <div
        className="relative flex items-center justify-center"
        style={{ width: metrics.size, height: metrics.size }}
      >
        <svg
          className="absolute inset-0"
          width={metrics.size}
          height={metrics.size}
          viewBox={`0 0 ${metrics.size} ${metrics.size}`}
          role="presentation"
        >
          <circle
            cx={metrics.size / 2}
            cy={metrics.size / 2}
            r={metrics.radius}
            stroke="var(--border-subtle)"
            strokeWidth={metrics.strokeWidth}
            fill="transparent"
          />
          <circle
            cx={metrics.size / 2}
            cy={metrics.size / 2}
            r={metrics.radius}
            stroke="url(#maximal-clock-stroke)"
            strokeWidth={metrics.strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={metrics.circumference}
            strokeDashoffset={metrics.dashOffset}
            className="origin-center -rotate-90 transition-[stroke-dashoffset] duration-700 ease-out"
          />
          <defs>
            <linearGradient id="maximal-clock-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-solid)" />
              <stop offset="100%" stopColor="var(--accent-solid-hover)" />
            </linearGradient>
          </defs>
        </svg>
        <button
          type="button"
          onClick={handleToggle}
          className={clsx(
            'relative flex h-full w-full flex-col items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] text-[color:var(--text-primary)] shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-sm transition-transform duration-300 ease-out hover:scale-105 active:scale-95',
            timerState.isRunning && 'animate-soft-pulse',
          )}
          aria-label={timerState.isRunning ? 'Pause timer' : 'Start timer'}
        >
          <span className="text-[4rem] font-semibold tracking-tight sm:text-[4.5rem]">
            {formatTime(timerState.remainingMs)}
          </span>
          <span className="mt-3 text-xs uppercase tracking-[0.5em] text-muted">
            {modeLabel}
          </span>
          {activeTask ? (
            <span className="mt-2 max-w-[70%] truncate text-xs text-muted">
              {activeTask.title}
            </span>
          ) : null}
          <span className="mt-6 flex items-center gap-2 text-xs text-muted">
            {timerState.isRunning ? (
              <>
                <FiPause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <FiPlay className="h-4 w-4" />
                Start
              </>
            )}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] px-5 py-2 text-sm text-[color:var(--text-primary)] transition hover:border-[color:var(--accent-ring)] hover:bg-[color:var(--surface-overlay-soft)]"
      >
        <FiRotateCcw className="h-4 w-4" />
        Reset session
      </button>
    </div>
  );
};
