'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppServices } from '../context/app-context';
import { Button } from './primitives/button';

export const ThemeToggle = () => {
  const theme = useAppSelector((state) => state.settings.theme);
  const { settings } = useAppServices();
  const toggle = () => settings.updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      icon={theme === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Night' : 'Day'}
    </Button>
  );
};
