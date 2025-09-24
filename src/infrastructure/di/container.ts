import { createAppStore } from '../../application/state/app-store';
import { defaultAppState } from '../../application/state/app-reducer';
import type { AppState } from '../../application/state/app-reducer';
import { createApplicationServices } from '../../application/services/app-services';
import { BrowserAudioService, SilentAudioService } from '../audio/browser-audio-service';
import {
  BrowserNotificationService,
  NoopNotificationService,
} from '../notifications/browser-notification-service';
import { LocalStorageAppStateRepository } from '../persistence/local-storage-app-state-repository';
import { systemTime } from '../../application/ports/time-port';
import { uuidFromCrypto } from '../../application/ports/uuid-port';
import type { ApplicationServices } from '../../application/services/app-services';

const mergeState = (stored: AppState | null): AppState => {
  const defaults = defaultAppState();
  if (!stored) {
    return defaults;
  }
  return {
    ...defaults,
    ...stored,
    timer: {
      ...defaults.timer,
      ...stored.timer,
      config: {
        ...defaults.timer.config,
        ...stored.timer?.config,
        durations: {
          ...defaults.timer.config.durations,
          ...stored.timer?.config?.durations,
        },
        preferences: {
          ...defaults.timer.config.preferences,
          ...stored.timer?.config?.preferences,
        },
      },
      state: {
        ...defaults.timer.state,
        ...stored.timer?.state,
      },
    },
    settings: {
      ...defaults.settings,
      ...stored.settings,
      background: {
        ...defaults.settings.background,
        ...stored.settings?.background,
      },
    },
    templates: stored.templates?.length ? stored.templates : defaults.templates,
  };
};

export const createBrowserContainer = async (): Promise<ApplicationServices> => {
  const repository = new LocalStorageAppStateRepository();
  const stored = await repository.load();
  const initialState = mergeState(stored);
  const store = createAppStore(initialState);
  const audio = typeof window !== 'undefined' ? new BrowserAudioService() : new SilentAudioService();
  const notifications =
    typeof window !== 'undefined' ? new BrowserNotificationService() : new NoopNotificationService();
  const services = createApplicationServices({
    store,
    audio,
    notifications,
    time: systemTime,
    uuid: uuidFromCrypto,
  });

  if (typeof window !== 'undefined') {
    let current = store.getState();
    store.subscribe((next) => {
      if (next === current) {
        return;
      }
      current = next;
      void repository.save(next);
    });
  }

  return services;
};
