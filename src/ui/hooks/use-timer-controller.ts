'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppServices } from '../context/app-context';

export const useTimerController = (): void => {
  const { timer } = useAppServices();
  const isRunning = useAppSelector((state) => state.timer.state.isRunning);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const id = window.setInterval(() => {
      timer.tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, timer]);
};
