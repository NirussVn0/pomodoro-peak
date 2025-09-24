'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppServices } from '../context/app-context';

export const ThemeToggle = () => {
  const theme = useAppSelector((state) => state.settings.theme);
  const { settings } = useAppServices();
  const toggle = () => settings.updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span>{theme === 'dark' ? 'Night' : 'Day'}</span>
    </button>
  );
};
