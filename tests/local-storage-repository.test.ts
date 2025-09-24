import { describe, expect, it, beforeEach } from 'vitest';
import { LocalStorageAppStateRepository } from '@/infrastructure/persistence/local-storage-app-state-repository';
import { defaultAppState } from '@/application/state/app-reducer';

const STORAGE_KEY = 'pomodoro.app.v1';

describe('LocalStorageAppStateRepository', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and loads application state', async () => {
    const repository = new LocalStorageAppStateRepository();
    const state = defaultAppState();
    const patched = {
      ...state,
      stats: { ...state.stats, sessionsToday: 3 },
      settings: { ...state.settings, theme: 'light' as const },
    };
    await repository.save(patched);
    const loaded = await repository.load();
    expect(loaded).toEqual(patched);
  });

  it('clears the stored state', async () => {
    const repository = new LocalStorageAppStateRepository();
    await repository.save(defaultAppState());
    await repository.clear();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
