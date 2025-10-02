'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { useAppSelector, useAppServices } from '../context/app-context';
import { Button } from './primitives/button';
import type { BackgroundKind } from '../../domain/value-objects/background';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const backgroundKinds: { value: BackgroundKind; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
];

const defaultBackgroundByKind: Record<BackgroundKind, string> = {
  solid: '#141824',
  gradient: 'linear-gradient(135deg, rgba(79,70,229,0.85), rgba(167,139,250,0.8))',
  image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
};

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const { timer, settings } = useAppServices();
  const durations = useAppSelector((state) => state.timer.config.durations);
  const preferences = useAppSelector((state) => state.timer.config.preferences);
  const appSettings = useAppSelector((state) => state.settings);
  const [backgroundValue, setBackgroundValue] = useState(
    appSettings.background.value ?? defaultBackgroundByKind[appSettings.background.kind],
  );

  useEffect(() => {
    setBackgroundValue(appSettings.background.value);
  }, [appSettings.background.value]);

  const handleBackgroundChange = (kind: BackgroundKind, value: string) => {
    const safeValue = value || defaultBackgroundByKind[kind];
    setBackgroundValue(safeValue);
    settings.updateBackground({
      ...appSettings.background,
      kind,
      value: safeValue,
    });
  };

  const sliderLabel = useMemo(
    () => `${Math.round(appSettings.background.opacity * 100)}%`,
    [appSettings.background.opacity],
  );

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-3"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-3"
            >
              <Dialog.Panel className="rounded-lg border border-subtle bg-surface-card p-8 shadow-elevated backdrop-blur-xl">
                <Dialog.Title className="text-2xl font-semibold text-primary">Workspace settings</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-muted">
                  Tailor focus durations, sounds, and ambience. All changes are saved automatically.
                </Dialog.Description>

                <section className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-subtle bg-surface-overlay-soft p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Durations</h3>
                    <div className="mt-4 space-y-3 text-sm text-primary">
                      {(
                        [
                          { key: 'focus' as const, label: 'Focus (minutes)' },
                          { key: 'shortBreak' as const, label: 'Short break (minutes)' },
                          { key: 'longBreak' as const, label: 'Long break (minutes)' },
                        ]
                      ).map((item) => (
                        <label key={item.key} className="flex items-center justify-between gap-3">
                          <span>{item.label}</span>
                          <input
                            type="number"
                            min={1}
                            value={durations[item.key]}
                            onChange={(event) => {
                              const parsed = Number(event.target.value);
                              const nextValue = Number.isNaN(parsed) ? durations[item.key] : Math.max(1, parsed);
                              timer.updateDurations({
                                ...durations,
                                [item.key]: nextValue,
                              });
                            }}
                            className="w-20 rounded-lg border border-subtle bg-surface-card px-3 py-2 text-right text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-subtle bg-surface-overlay-soft p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Automation & sounds</h3>
                    <div className="mt-4 space-y-3 text-sm text-primary">
                      <label className="flex items-center justify-between gap-3">
                        <span>Auto-start focus sessions</span>
                        <input
                          type="checkbox"
                          checked={preferences.autoStartFocus}
                          onChange={(event) =>
                            timer.updatePreferences({ autoStartFocus: event.target.checked })
                          }
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Auto-start breaks</span>
                        <input
                          type="checkbox"
                          checked={preferences.autoStartBreaks}
                          onChange={(event) =>
                            timer.updatePreferences({ autoStartBreaks: event.target.checked })
                          }
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Tick sound</span>
                        <input
                          type="checkbox"
                          checked={preferences.tickSound}
                          onChange={(event) => timer.updatePreferences({ tickSound: event.target.checked })}
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Alarm on completion</span>
                        <input
                          type="checkbox"
                          checked={preferences.alarmSound}
                          onChange={(event) => timer.updatePreferences({ alarmSound: event.target.checked })}
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Desktop notifications</span>
                        <input
                          type="checkbox"
                          checked={appSettings.notification.desktop}
                          onChange={(event) =>
                            settings.updateSettings({
                              notification: { desktop: event.target.checked },
                            })
                          }
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Keyboard shortcuts</span>
                        <input
                          type="checkbox"
                          checked={appSettings.shortcuts.enabled}
                          onChange={(event) =>
                            settings.updateSettings({
                              shortcuts: { enabled: event.target.checked },
                            })
                          }
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="rounded-lg border border-subtle bg-surface-overlay-soft p-5 md:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Theme & background</h3>
                    <div className="mt-4 flex flex-col gap-4 text-sm text-primary">
                      <div className="flex items-center gap-3">
                        <span>Theme</span>
                        <div className="flex gap-2">
                          {(
                            [
                              { value: 'dark' as const, label: 'Night' },
                              { value: 'light' as const, label: 'Day' },
                            ]
                          ).map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              size="sm"
                              variant={appSettings.theme === option.value ? 'primary' : 'secondary'}
                              onClick={() => settings.updateSettings({ theme: option.value })}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {backgroundKinds.map((item) => (
                          <Button
                            key={item.value}
                            type="button"
                            size="sm"
                            variant={appSettings.background.kind === item.value ? 'primary' : 'secondary'}
                            onClick={() =>
                              handleBackgroundChange(
                                item.value,
                                item.value === appSettings.background.kind
                                  ? backgroundValue
                                  : defaultBackgroundByKind[item.value],
                              )
                            }
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      <label className="flex items-center gap-3">
                        <span className="w-32 text-muted">Background value</span>
                        {appSettings.background.kind === 'solid' ? (
                          <input
                            type="color"
                            value={backgroundValue}
                            onChange={(event) => handleBackgroundChange('solid', event.target.value)}
                            className="h-10 w-20 rounded-lg border border-subtle bg-transparent"
                          />
                        ) : (
                          <input
                            type="text"
                            value={backgroundValue}
                            onChange={(event) => handleBackgroundChange(appSettings.background.kind, event.target.value)}
                            placeholder={
                              appSettings.background.kind === 'image'
                                ? 'Image URL'
                                : 'CSS gradient (e.g. linear-gradient(...))'
                            }
                            className="flex-1 rounded-lg border border-subtle bg-surface-card px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          />
                        )}
                      </label>
                      <label className="flex items-center gap-3">
                        <span className="w-32 text-muted">Blur</span>
                        <input
                          type="range"
                          min={0}
                          max={18}
                          value={appSettings.background.blur}
                          onChange={(event) =>
                            settings.updateBackground({
                              ...appSettings.background,
                              blur: Number(event.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-xs text-muted">{appSettings.background.blur}px</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <span className="w-32 text-muted">Opacity</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(appSettings.background.opacity * 100)}
                          onChange={(event) =>
                            settings.updateBackground({
                              ...appSettings.background,
                              opacity: Number(event.target.value) / 100,
                            })
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-xs text-muted">{sliderLabel}</span>
                      </label>
                    </div>
                  </div>
                </section>

                <div className="mt-8 flex justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
