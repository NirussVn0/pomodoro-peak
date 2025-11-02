import type { AppStore } from '../state/app-store';
import type { BackgroundSettings } from '../../domain/value-objects/background';
import type { AppSettings, LayoutSettings } from '../../domain/value-objects/settings';
import type { NotificationPort } from '../ports/notification-port';

export class SettingsService {
  constructor(private readonly store: AppStore, private readonly notifications: NotificationPort) {}

  updateSettings(settings: Partial<Omit<AppSettings, 'layout'>> & { readonly layout?: Partial<LayoutSettings> }): void {
    if (settings.notification?.desktop) {
      void this.notifications.requestPermission();
    }
    this.store.dispatch({ type: 'settings/update', settings });
  }

  updateBackground(background: BackgroundSettings): void {
    this.store.dispatch({ type: 'settings/update-background', background });
  }
}
