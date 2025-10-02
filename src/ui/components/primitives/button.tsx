import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-elevated hover:bg-[color:var(--accent-solid-hover)]',
  secondary:
    'border-[color:var(--border-strong)] bg-[color:var(--surface-card-elevated)] text-[color:var(--text-primary)] hover:border-[color:var(--accent-ring)]',
  ghost:
    'border-transparent bg-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base font-semibold',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', icon, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)] disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
