'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppServices } from '../context/app-context';
import { Button } from './primitives/button';
import { ToggleSwitch } from './primitives/toggle-switch';
import type { BackgroundKind, BackgroundSettings } from '../../domain/value-objects/background';
import { DEFAULT_BACKGROUNDS } from '../../domain/value-objects/background';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const backgroundKinds: { value: BackgroundKind; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
];

const defaultBackgroundByKind: Record<BackgroundKind, BackgroundSettings> = DEFAULT_BACKGROUNDS.reduce(
  (acc, item) => ({
    ...acc,
    [item.kind]: item,
  }),
  {
    solid: DEFAULT_BACKGROUNDS[0],
    gradient: DEFAULT_BACKGROUNDS[1],
    image: DEFAULT_BACKGROUNDS[2],
  } as Record<BackgroundKind, BackgroundSettings>,
);

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const { timer, settings } = useAppServices();
  const durations = useAppSelector((state) => state.timer.config.durations);
  const preferences = useAppSelector((state) => state.timer.config.preferences);
  const appSettings = useAppSelector((state) => state.settings);
  const [backgroundValue, setBackgroundValue] = useState(
    appSettings.background.value ?? defaultBackgroundByKind[appSettings.background.kind].value,
  );

  useEffect(() => {
    setBackgroundValue(appSettings.background.value);
  }, [appSettings.background.value]);

  const handleBackgroundPreset = (preset: BackgroundSettings) => {
    const payload = { ...preset };
    setBackgroundValue(payload.value);
    settings.updateBackground(payload);
  };

  const handleBackgroundKindChange = (kind: BackgroundKind) => {
    const preset = defaultBackgroundByKind[kind];
    handleBackgroundPreset({ ...preset });
  };

  const handleBackgroundValueSave = () => {
    const trimmed = backgroundValue.trim();
    const source = defaultBackgroundByKind[appSettings.background.kind];
    const valueToPersist = trimmed.length > 0 ? backgroundValue : source.value;
    settings.updateBackground({
      ...appSettings.background,
      value: valueToPersist,
    });
    setBackgroundValue(valueToPersist);
  };

  const sliderLabel = useMemo(
    () => `${Math.round(appSettings.background.opacity * 100)}%`,
    [appSettings.background.opacity],
  );

  const isBackgroundDirty =
    backgroundValue.trim() !== (appSettings.background.value ?? '').trim();

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
                      <div className="flex items-center justify-between gap-3">
                        <span>Auto-start focus sessions</span>
                        <ToggleSwitch
                          checked={preferences.autoStartFocus}
                          onClick={() =>
                            timer.updatePreferences({ autoStartFocus: !preferences.autoStartFocus })
                          }
                          aria-label="Toggle auto-start focus sessions"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Auto-start breaks</span>
                        <ToggleSwitch
                          checked={preferences.autoStartBreaks}
                          onClick={() =>
                            timer.updatePreferences({ autoStartBreaks: !preferences.autoStartBreaks })
                          }
                          aria-label="Toggle auto-start breaks"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Tick sound</span>
                        <ToggleSwitch
                          checked={preferences.tickSound}
                          onClick={() => timer.updatePreferences({ tickSound: !preferences.tickSound })}
                          aria-label="Toggle tick sound"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Alarm on completion</span>
                        <ToggleSwitch
                          checked={preferences.alarmSound}
                          onClick={() => timer.updatePreferences({ alarmSound: !preferences.alarmSound })}
                          aria-label="Toggle alarm on completion"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Auto-complete focused task</span>
                        <ToggleSwitch
                          checked={appSettings.tasks.autoCompleteOnFocusEnd}
                          onClick={() =>
                            settings.updateSettings({
                              tasks: {
                                autoCompleteOnFocusEnd: !appSettings.tasks.autoCompleteOnFocusEnd,
                              },
                            })
                          }
                          aria-label="Toggle auto-complete focused task"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Move completed tasks down</span>
                        <ToggleSwitch
                          checked={appSettings.tasks.autoSortCompleted}
                          onClick={() =>
                            settings.updateSettings({
                              tasks: { autoSortCompleted: !appSettings.tasks.autoSortCompleted },
                            })
                          }
                          aria-label="Toggle moving completed tasks down"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Desktop notifications</span>
                        <ToggleSwitch
                          checked={appSettings.notification.desktop}
                          onClick={() =>
                            settings.updateSettings({
                              notification: { desktop: !appSettings.notification.desktop },
                            })
                          }
                          aria-label="Toggle desktop notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Keyboard shortcuts</span>
                        <ToggleSwitch
                          checked={appSettings.shortcuts.enabled}
                          onClick={() =>
                            settings.updateSettings({
                              shortcuts: { enabled: !appSettings.shortcuts.enabled },
                            })
                          }
                          aria-label="Toggle keyboard shortcuts"
                        />
                      </div>
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
                        {backgroundKinds.map((item) => {
                          const isActive = appSettings.background.kind === item.value;
                          return (
                            <Button
                              key={item.value}
                              type="button"
                              size="sm"
                              variant={isActive ? 'primary' : 'secondary'}
                              onClick={() => handleBackgroundKindChange(item.value)}
                            >
                              {item.label}
                            </Button>
                          );
                        })}
                      </div>
                      <label className="flex items-center gap-3">
                        <span className="w-32 text-muted">Background value</span>
                        {appSettings.background.kind === 'solid' ? (
                          <input
                            type="color"
                            value={backgroundValue}
                            onChange={(event) =>
                              handleBackgroundPreset({
                                ...appSettings.background,
                                kind: 'solid',
                                value: event.target.value,
                              })
                            }
                            className="h-10 w-20 rounded-lg border border-subtle bg-transparent"
                          />
                        ) : (
                          <div className="flex flex-1 items-center gap-2">
                            <input
                              type="text"
                              value={backgroundValue}
                              onChange={(event) => setBackgroundValue(event.target.value)}
                              placeholder={
                                appSettings.background.kind === 'image'
                                  ? 'Image URL'
                                  : 'CSS gradient (e.g. linear-gradient(...))'
                              }
                              className="flex-1 rounded-lg border border-subtle bg-surface-card px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={handleBackgroundValueSave}
                              disabled={!isBackgroundDirty}
                            >
                              Save
                            </Button>
                          </div>
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
