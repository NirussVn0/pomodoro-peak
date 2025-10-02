import { expect, vi } from 'vitest';

const fakeRandomUUID = (): `${string}-${string}-${string}-${string}-${string}` => {
  const randomHex = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const segment1 = randomHex(8);
  const segment2 = randomHex(4);
  const segment3 = `4${randomHex(3)}`;
  const segment4 = `${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}`;
  const segment5 = randomHex(12);
  return `${segment1}-${segment2}-${segment3}-${segment4}-${segment5}`;
};

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as unknown as { crypto: Crypto }).crypto = {
    randomUUID: fakeRandomUUID,
  } as Crypto;
} else if (typeof globalThis.crypto.randomUUID === 'undefined') {
  globalThis.crypto.randomUUID = fakeRandomUUID;
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
