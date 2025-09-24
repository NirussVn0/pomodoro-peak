import { expect, vi } from 'vitest';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as unknown as { crypto: Crypto }).crypto = {
    randomUUID: () => `test-${Math.random().toString(16).slice(2)}`,
  } as Crypto;
} else if (typeof globalThis.crypto.randomUUID === 'undefined') {
  globalThis.crypto.randomUUID = () => `test-${Math.random().toString(16).slice(2)}`;
}


if (typeof window !== 'undefined') {
  // @ts-expect-error test shim
  window.AudioContext = class {
    createOscillator() {
      return {
        frequency: { value: 0 },
        type: 'sine',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null as (() => void) | null,
      } as unknown as OscillatorNode;
    }
    createGain() {
      return {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      } as unknown as GainNode;
    }
    get currentTime() {
      return 0;
    }
    close = vi.fn().mockResolvedValue(undefined);
  } as typeof AudioContext;
}

globalThis.fetch = vi.fn();

expect.extend({});
