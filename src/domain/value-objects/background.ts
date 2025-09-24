export type BackgroundKind = 'solid' | 'gradient' | 'image';

export interface BackgroundSettings {
  readonly kind: BackgroundKind;
  readonly value: string;
  readonly blur: number;
  readonly opacity: number;
}

export const DEFAULT_BACKGROUNDS: readonly BackgroundSettings[] = [
  { kind: 'solid', value: '#141824', blur: 0, opacity: 1 },
  {
    kind: 'gradient',
    value: 'linear-gradient(135deg, rgba(79,70,229,0.85), rgba(167,139,250,0.8))',
    blur: 0,
    opacity: 0.85,
  },
  {
    kind: 'image',
    value: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    blur: 6,
    opacity: 0.6,
  },
];

export const DEFAULT_BACKGROUND: BackgroundSettings = DEFAULT_BACKGROUNDS[0];
