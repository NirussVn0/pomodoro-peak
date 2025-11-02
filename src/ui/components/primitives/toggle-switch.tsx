'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ToggleSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  readonly checked: boolean;
}

export const ToggleSwitch = forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, disabled, className, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]',
        checked
          ? 'bg-[color:var(--accent-solid)] shadow-[0_6px_16px_rgba(78,207,255,0.35)]'
          : 'bg-surface-overlay-soft border-subtle',
        disabled && 'opacity-50',
        className,
      )}
    >
      <span
        className={clsx(
          'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
          disabled && 'bg-white/70',
        )}
      />
    </button>
  ),
);

ToggleSwitch.displayName = 'ToggleSwitch';
