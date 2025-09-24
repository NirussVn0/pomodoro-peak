'use client';

import { useAppSelector } from '../context/app-context';

export const StatsMini = () => {
  const stats = useAppSelector((state) => state.stats);
  const tasks = useAppSelector((state) => state.tasks);
  const completed = tasks.filter((task) => task.completed).length;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Today</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-white">{stats.sessionsToday}</p>
          <p className="text-xs text-slate-400">Focus sessions</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{completed}</p>
          <p className="text-xs text-slate-400">Tasks done</p>
        </div>
      </div>
    </div>
  );
};
