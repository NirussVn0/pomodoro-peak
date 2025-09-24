'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { ApplicationServices } from '../../application/services/app-services';
import type { AppState } from '../../application/state/app-reducer';
import { createBrowserContainer } from '../../infrastructure/di/container';

type AppContextValue = ApplicationServices;

const AppServicesContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { readonly children: ReactNode }) => {
  const [services, setServices] = useState<ApplicationServices | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createBrowserContainer().then((container) => {
      if (!cancelled) {
        setServices(container);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!services) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1218] text-slate-200">
        <span className="animate-pulse text-sm tracking-wide">Preparing your focus space…</span>
      </div>
    );
  }

  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>;
};

export const useAppServices = (): AppContextValue => {
  const context = useContext(AppServicesContext);
  if (!context) {
    throw new Error('AppServicesContext unavailable');
  }
  return context;
};

export const useAppSelector = <T,>(selector: (state: AppState) => T): T => {
  const services = useAppServices();
  return useSyncExternalStore(
    services.store.subscribe,
    () => selector(services.store.getState()),
    () => selector(services.store.getState()),
  );
};
