'use client';

import { useEffect, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useAppSelector } from '../context/app-context';

export const AppShell = ({ children }: { readonly children: ReactNode }) => {
  const background = useAppSelector((state) => state.settings.background);
  const theme = useAppSelector((state) => state.settings.theme);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const wrapperStyle = useMemo<CSSProperties>(() => {
    if (background.kind === 'solid') {
      return { background: background.value };
    }
    if (background.kind === 'gradient') {
      return { backgroundImage: background.value };
    }
    return {
      backgroundImage: `url(${background.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }, [background]);

  const overlayStyle = useMemo<CSSProperties>(() => {
    const blurValue = `blur(${background.blur}px)` as CSSProperties['backdropFilter'];
    const baseColor = theme === 'dark' ? '15, 18, 24' : '243, 244, 255';
    const intensity = (() => {
      if (background.kind === 'image') {
        return theme === 'dark'
          ? Math.max(0.35, 1 - background.opacity)
          : Math.max(0.25, 0.7 - background.opacity * 0.5);
      }
      return theme === 'dark' ? Math.max(0.2, 1 - background.opacity) : 0.18;
    })();
    return {
      backdropFilter: blurValue,
      backgroundColor: `rgba(${baseColor}, ${Math.min(0.95, intensity)})`,
    };
  }, [background, theme]);

  return (
    <div className="min-h-screen w-full text-primary transition-colors">
      <div className="fixed inset-0 -z-20" style={wrapperStyle} />
      <div className="fixed inset-0 -z-10 transition duration-500" style={overlayStyle} />
      <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
        {children}
      </div>
    </div>
  );
};
