'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppServices } from '../context/app-context';
import { TIMER_MODES } from '../../domain/entities/timer';

interface ShortcutHandlers {
  readonly onOpenSettings: () => void;
  readonly onNewTask: () => void;
}

export const useKeyboardShortcuts = ({ onOpenSettings, onNewTask }: ShortcutHandlers): void => {
  const { timer } = useAppServices();
  const shortcutsEnabled = useAppSelector((state) => state.settings.shortcuts.enabled);
  const isRunning = useAppSelector((state) => state.timer.state.isRunning);
  const currentMode = useAppSelector((state) => state.timer.state.mode);
  const router = useRouter();

  useEffect(() => {
    if (!shortcutsEnabled) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (event.repeat) {
        return;
      }
      switch (event.key.toLowerCase()) {
        case ' ': {
          event.preventDefault();
          if (isRunning) {
            timer.pause();
          } else {
            timer.start();
          }
          break;
        }
        case 'r': {
          event.preventDefault();
          timer.reset();
          break;
        }
        case '1': {
          event.preventDefault();
          timer.switchMode('focus');
          break;
        }
        case '2': {
          event.preventDefault();
          timer.switchMode('shortBreak');
          break;
        }
        case '3': {
          event.preventDefault();
          timer.switchMode('longBreak');
          break;
        }
        case 'p': {
          event.preventDefault();
          const index = Math.max(0, TIMER_MODES.indexOf(currentMode));
          const next = TIMER_MODES[(index + 1) % TIMER_MODES.length];
          timer.switchMode(next);
          break;
        }
        case 'n': {
          event.preventDefault();
          onNewTask();
          break;
        }
        case 's': {
          event.preventDefault();
          onOpenSettings();
          break;
        }
        case 't': {
          event.preventDefault();
          router.push('/templates');
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentMode, isRunning, onNewTask, onOpenSettings, router, shortcutsEnabled, timer]);
};
