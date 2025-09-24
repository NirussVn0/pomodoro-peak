import type { NotificationPort } from '../../application/ports/notification-port';

export class BrowserNotificationService implements NotificationPort {
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    return Notification.requestPermission();
  }

  notify(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission !== 'granted') {
      return;
    }
    new Notification(title, options);
  }
}

export class NoopNotificationService implements NotificationPort {
  async requestPermission(): Promise<NotificationPermission> {
    return 'denied';
  }

  notify(): void {}
}
