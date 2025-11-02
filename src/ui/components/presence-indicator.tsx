'use client';

import { FiUsers } from 'react-icons/fi';
import { usePomodoroPresence } from '../hooks/use-pomodoro-presence';

export const PresenceIndicator = () => {
  const count = usePomodoroPresence();
  return (
    <div className="flex items-center gap-2 rounded-full border border-subtle bg-surface-overlay-soft px-3 py-1.5 text-sm text-primary shadow-[0_6px_16px_rgba(78,207,255,0.15)]">
      <FiUsers className="h-4 w-4 text-[color:var(--accent-ring)]" />
      <span className="font-semibold">{count}</span>
    </div>
  );
};
