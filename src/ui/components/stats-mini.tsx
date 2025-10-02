'use client';

import { useAppSelector } from '../context/app-context';

export const StatsMini = () => {
  const stats = useAppSelector((state) => state.stats);
  const tasks = useAppSelector((state) => state.tasks);
  const completed = tasks.filter((task) => task.completed).length;
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
