'use client';

import { useAppSelector } from '../context/app-context';

interface StatsMiniProps {
  readonly variant?: 'default' | 'compact';
}

export const StatsMini = ({ variant = 'default' }: StatsMiniProps) => {
  const stats = useAppSelector((state) => state.stats);
  const tasks = useAppSelector((state) => state.tasks);
  const completed = tasks.filter((task) => task.completed).length;
  if (variant === 'compact') {
    return (
      <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-[0_18px_38px_rgba(20,20,60,0.45)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Sessions</span>
            <span className="text-3xl font-semibold">{stats.sessionsToday}</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Tasks</span>
            <span className="text-3xl font-semibold">{completed}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-subtle bg-surface-overlay-soft p-4 text-sm text-primary">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">Today</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-primary">{stats.sessionsToday}</p>
          <p className="text-xs text-muted">Focus sessions</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-primary">{completed}</p>
          <p className="text-xs text-muted">Tasks done</p>
        </div>
      </div>
    </div>
  );
};
