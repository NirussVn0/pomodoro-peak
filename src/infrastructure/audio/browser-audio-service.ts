import type { AudioPort } from '../../application/ports/audio-port';

const playTone = (frequency: number, durationMs: number): void => {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return;
  }
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.setValueAtTime(0.2, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + durationMs / 1000);
  oscillator.stop(context.currentTime + durationMs / 1000);
  oscillator.onended = () => {
    context.close().catch(() => {
      /* ignore */
    });
  };
};

export class BrowserAudioService implements AudioPort {
  playAlarm(): void {
    playTone(660, 600);
    setTimeout(() => playTone(440, 400), 250);
  }

  playTick(): void {
    playTone(880, 100);
  }
}

export class SilentAudioService implements AudioPort {
  playAlarm(): void {}
  playTick(): void {}
}
