export interface NotificationPort {
  requestPermission(): Promise<NotificationPermission>;
  notify(title: string, options?: NotificationOptions): void;
}
