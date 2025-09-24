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
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const wrapperStyle = useMemo<CSSProperties>(() => {
    if (background.kind === 'solid') {
      return { background: background.value };
    }
    if (background.kind === 'gradient') {
      return { backgroundImage: background.value };
    }
    return { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }, [background]);

  const overlayStyle = useMemo<CSSProperties>(() => {
    const blurValue = `blur(${background.blur}px)` as CSSProperties['backdropFilter'];
    if (background.kind === 'image') {
      return {
        backdropFilter: blurValue,
        backgroundColor: `rgba(15, 18, 24, ${Math.max(0, 1 - background.opacity)})`,
      };
    }
    return {
      backdropFilter: blurValue,
      backgroundColor: `rgba(15, 18, 24, ${1 - background.opacity})`,
    };
  }, [background]);

  return (
    <div className="min-h-screen w-full text-slate-900 transition-colors dark:text-slate-100">
      <div className="fixed inset-0 -z-20" style={wrapperStyle} />
      <div className="fixed inset-0 -z-10 transition duration-500" style={overlayStyle} />
      <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
        {children}
      </div>
    </div>
  );
};
