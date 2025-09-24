import type { AppStateRepository } from '../../application/ports/app-state-repository';
import type { AppState } from '../../application/state/app-reducer';

const STORAGE_KEY = 'pomodoro.app.v1';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const resolveStorage = (): StorageLike | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('LocalStorage unavailable', error);
    return null;
  }
};

export class LocalStorageAppStateRepository implements AppStateRepository {
  private readonly storage = resolveStorage();

  async load(): Promise<AppState | null> {
    if (!this.storage) {
      return null;
    }
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as AppState;
      return parsed;
    } catch (error) {
      console.warn('Failed to parse stored state', error);
      return null;
    }
  }

  async save(state: AppState): Promise<void> {
    if (!this.storage) {
      return;
    }
    const payload = JSON.stringify(state);
    this.storage.setItem(STORAGE_KEY, payload);
  }

  async clear(): Promise<void> {
    if (!this.storage) {
      return;
    }
    this.storage.removeItem(STORAGE_KEY);
  }
}

export class MemoryAppStateRepository implements AppStateRepository {
  private cache: AppState | null = null;

  async load(): Promise<AppState | null> {
    return this.cache;
  }

  async save(state: AppState): Promise<void> {
    this.cache = state;
  }

  async clear(): Promise<void> {
    this.cache = null;
  }
}
