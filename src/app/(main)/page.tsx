"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import type { IconType } from "react-icons";
import { FiColumns, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import type { TimerViewMode } from "../../domain/value-objects/settings";
import { Sidebar } from "../../ui/components/sidebar";
import { TimerCard, TimerMiniCard } from "../../ui/components/timer-card";
import { TodoCard } from "../../ui/components/todo-card";
import { StatsMini } from "../../ui/components/stats-mini";
import { ThemeToggle } from "../../ui/components/theme-toggle";
import { BackgroundMenu } from "../../ui/components/background-menu";
import { SettingsDialog } from "../../ui/components/settings-dialog";
import { PresenceIndicator } from "../../ui/components/presence-indicator";
import { useKeyboardShortcuts } from "../../ui/hooks/use-keyboard-shortcuts";
import { useAppServices, useAppSelector } from "../../ui/context/app-context";

const layoutOptions: { value: TimerViewMode; icon: IconType; label: string }[] = [
  { value: "split", icon: FiColumns, label: "Split view" },
  { value: "focused", icon: FiMaximize2, label: "Focused view" },
  { value: "mini", icon: FiMinimize2, label: "Mini view" },
];

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { templates, settings } = useAppServices();
  const layoutMode = useAppSelector((state) => state.settings.layout.timerView);

  useKeyboardShortcuts({
    onOpenSettings: () => setSettingsOpen(true),
    onNewTask: () => {
      inputRef.current?.focus();
    },
  });

  const handleCreateTemplate = () => {
    const name = window.prompt("Template name");
    if (!name) {
      return;
    }
    templates.createFromCurrentTasks(name);
  };

  const handleLayoutChange = (mode: TimerViewMode) => {
    settings.updateSettings({ layout: { timerView: mode } });
  };

  let content: JSX.Element;

  if (layoutMode === "focused") {
    content = (
      <div className="flex flex-1 flex-col gap-6">
        <TimerCard onOpenSettings={() => setSettingsOpen(true)} variant="focused" />
        <div className="grid gap-6 xl:grid-cols-2">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
          <StatsMini />
        </div>
      </div>
    );
  } else if (layoutMode === "mini") {
    content = (
      <div className="flex flex-1 flex-col gap-6 pb-24">
        <div className="grid gap-6 xl:grid-cols-2">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
          <StatsMini />
        </div>
        <div className="pointer-events-none fixed bottom-6 right-6 z-40">
          <div className="pointer-events-auto">
            <TimerMiniCard
              onOpenSettings={() => setSettingsOpen(true)}
              onExpand={(mode) => handleLayoutChange(mode)}
            />
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="grid flex-1 gap-6 xl:grid-cols-2">
        <TimerCard onOpenSettings={() => setSettingsOpen(true)} />
        <div className="flex flex-col gap-6">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
          <StatsMini />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 md:gap-6 md:p-6 xl:flex-row xl:p-8">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex w-full flex-1 flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold text-white">Pomodoro Peak</h1>
            <p className="text-sm text-slate-400">
              Have a great day. Stay mindful of your focus and your breaks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PresenceIndicator />
            <ThemeToggle />
            <BackgroundMenu />
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 p-1 shadow-inner">
              {layoutOptions.map((option) => {
                const Icon = option.icon;
                const isActive = layoutMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLayoutChange(option.value)}
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-md transition',
                      isActive
                        ? 'bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[0_6px_16px_rgba(78,207,255,0.25)]'
                        : 'text-slate-300 hover:text-white',
                    )}
                    aria-label={option.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </header>
        {content}
        <footer className="text-center text-sm text-slate-700">
          Take a deep breath. You are doing great.
          <div>
            <a
              href="https://github.com/nirussvn0/pomodoro-peak"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub make by ☕and 💖
            </a>
          </div>
        </footer>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
