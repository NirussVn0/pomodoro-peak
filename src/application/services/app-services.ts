import type { AppStore } from '../state/app-store';
import { TimerService } from './timer-service';
import { TodoService } from './todo-service';
import { SettingsService } from './settings-service';
import { TemplateService } from './template-service';
import type { AudioPort } from '../ports/audio-port';
import type { NotificationPort } from '../ports/notification-port';
import type { TimePort } from '../ports/time-port';
import type { UuidPort } from '../ports/uuid-port';

export interface ApplicationServices {
  readonly timer: TimerService;
  readonly todo: TodoService;
  readonly settings: SettingsService;
  readonly templates: TemplateService;
  readonly store: AppStore;
}

export const createApplicationServices = (params: {
  readonly store: AppStore;
  readonly audio: AudioPort;
  readonly notifications: NotificationPort;
  readonly time: TimePort;
  readonly uuid: UuidPort;
}): ApplicationServices => {
  const timer = new TimerService(params.store, params.audio, params.notifications, params.time);
  const todo = new TodoService(params.store, params.uuid, params.time);
  const settings = new SettingsService(params.store, params.notifications);
  const templates = new TemplateService(params.store, params.uuid, params.time);
  return {
    timer,
    todo,
    settings,
    templates,
    store: params.store,
  };
};
