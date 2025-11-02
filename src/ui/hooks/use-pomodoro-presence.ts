'use client';

import { useEffect, useState } from 'react';

const CHANNEL_NAME = 'pomodoro-peak-presence';
const PING_INTERVAL = 5000;
const ENTRY_TTL = 15000;

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const usePomodoroPresence = (): number => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const id = createId();
    const members = new Map<string, number>();
    const updateCount = () => {
      const now = Date.now();
      for (const key of [...members.keys()]) {
        const timestamp = members.get(key) ?? 0;
        if (now - timestamp > ENTRY_TTL) {
          members.delete(key);
        }
      }
      setCount(members.size === 0 ? 1 : members.size);
    };
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
    const post = (message: { type: 'ping' | 'ack'; id: string; timestamp: number }) => {
      channel?.postMessage(message);
    };
    const mark = (entryId: string, timestamp: number) => {
      members.set(entryId, timestamp);
      updateCount();
    };
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; id?: string; timestamp?: number } | undefined;
      if (!data || !data.type || !data.id) {
        return;
      }
      const timestamp = typeof data.timestamp === 'number' ? data.timestamp : Date.now();
      mark(data.id, timestamp);
      if (data.type === 'ping' && data.id !== id) {
        post({ type: 'ack', id, timestamp: Date.now() });
      }
    };
    const announce = () => {
      const timestamp = Date.now();
      mark(id, timestamp);
      post({ type: 'ping', id, timestamp });
    };
    announce();
    const interval = window.setInterval(announce, PING_INTERVAL);
    channel?.addEventListener('message', handleMessage);
    return () => {
      channel?.removeEventListener('message', handleMessage);
      channel?.close();
      window.clearInterval(interval);
    };
  }, []);

  return count;
};
