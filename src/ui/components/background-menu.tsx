'use client';

import { clsx } from 'clsx';
import { useAppSelector, useAppServices } from '../context/app-context';
import { DEFAULT_BACKGROUNDS } from '../../domain/value-objects/background';

export const BackgroundMenu = () => {
  const background = useAppSelector((state) => state.settings.background);
  const { settings } = useAppServices();
  return (
    <div className="flex items-center gap-2">
      {DEFAULT_BACKGROUNDS.map((preset) => {
        const isActive = background.value === preset.value && background.kind === preset.kind;
        return (
          <button
            key={preset.value}
            type="button"
            onClick={() => settings.updateBackground(preset)}
            className={clsx(
              'h-10 w-10 rounded-lg border border-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]',
              isActive ? 'border-[color:var(--accent-ring)] ring-2 ring-[color:var(--accent-ring)]' : 'opacity-70 hover:opacity-100',
            )}
            style={
              preset.kind === 'image'
                ? {
                    backgroundImage: `url(${preset.value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {
                    background: preset.value,
                  }
            }
            aria-label={`Background preset ${preset.kind}`}
          />
        );
      })}
    </div>
  );
};
