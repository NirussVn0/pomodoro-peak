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
              'h-9 w-9 rounded-full border border-white/10 transition',
              isActive ? 'ring-2 ring-indigo-400' : 'opacity-60 hover:opacity-90',
            )}
            style={
              preset.kind === 'image'
                ? {
                    backgroundImage: `url(${preset.value})`,
                    backgroundSize: 'cover',
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
