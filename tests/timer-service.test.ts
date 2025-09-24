import { describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/application/state/app-store';
import { TimerService } from '@/application/services/timer-service';
import type { AudioPort } from '@/application/ports/audio-port';
import type { NotificationPort } from '@/application/ports/notification-port';
import type { TimePort } from '@/application/ports/time-port';

const createMocks = () => {
  const audio: AudioPort = {
    playAlarm: vi.fn(),
    playTick: vi.fn(),
  };
  const notifications: NotificationPort = {
    requestPermission: vi.fn().mockResolvedValue('granted'),
    notify: vi.fn(),
  };
  let now = 0;
  const time: TimePort = {
    now: () => now,
  };
  return {
    audio,
    notifications,
    time,
    advance: (delta: number) => {
      now += delta;
    },
    setNow: (value: number) => {
      now = value;
    },
  };
};

describe('TimerService', () => {
  it('rolls over to the next mode and increments stats when the timer completes', async () => {
    const store = createAppStore();
    const { audio, notifications, time, advance } = createMocks();
    const service = new TimerService(store, audio, notifications, time);

    service.updatePreferences({ tickSound: true });
    store.dispatch({ type: 'settings/update', settings: { notification: { desktop: true } } });
    store.dispatch({ type: 'timer/apply-remaining', remainingMs: 2000 });
    service.start();

    advance(1000);
    service.tick();
    expect(audio.playTick).toHaveBeenCalled();
    expect(store.getState().timer.state.remainingMs).toBeLessThan(2000);

    advance(2000);
    service.tick();
    await Promise.resolve();

    const state = store.getState();
    expect(state.stats.sessionsToday).toBe(1);
    expect(state.timer.state.mode).toBe('shortBreak');
    expect(state.timer.state.isRunning).toBe(true);
    expect(audio.playAlarm).toHaveBeenCalledTimes(1);
    expect(notifications.requestPermission).toHaveBeenCalled();
  });
});
