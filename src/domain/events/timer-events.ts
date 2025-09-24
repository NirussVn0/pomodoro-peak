import type { TimerMode } from '../entities/timer';

export interface TimerCompletedEvent {
  readonly mode: TimerMode;
  readonly completedAt: number;
}

export type DomainEvent = TimerCompletedEvent;
