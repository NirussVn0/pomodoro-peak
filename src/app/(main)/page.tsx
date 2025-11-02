"use client";

import { useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { IconType } from "react-icons";
import { FiColumns, FiMaximize2, FiMinimize2, FiMenu, FiX } from "react-icons/fi";
import type { TimerViewMode } from "../../domain/value-objects/settings";
import { Sidebar } from "../../ui/components/sidebar";
import { TimerCard, TimerMiniCard } from "../../ui/components/timer-card";
import { TodoCard } from "../../ui/components/todo-card";
import { StatsMini } from "../../ui/components/stats-mini";
import { ThemeToggle } from "../../ui/components/theme-toggle";
import { SettingsDialog } from "../../ui/components/settings-dialog";
import { PresenceIndicator } from "../../ui/components/presence-indicator";
import { KeyboardDialog } from "../../ui/components/keyboard-dialog";
import { Button } from "../../ui/components/primitives/button";
import { useKeyboardShortcuts } from "../../ui/hooks/use-keyboard-shortcuts";
import { useAppServices, useAppSelector } from "../../ui/context/app-context";

const layoutOptions: { value: TimerViewMode; icon: IconType; label: string }[] = [
  { value: "split", icon: FiColumns, label: "Split view" },
  { value: "maximal", icon: FiMaximize2, label: "Maximal view" },
  { value: "mini", icon: FiMinimize2, label: "Mini view" },
];

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maximalPanelOpen, setMaximalPanelOpen] = useState(false);
  const [maximalPanelView, setMaximalPanelView] = useState<"tasks" | "stats">("tasks");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { templates, settings } = useAppServices();
  const layoutMode = useAppSelector((state) => state.settings.layout.timerView);
  const isMaximal = layoutMode === "maximal";

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
    setMaximalPanelOpen(false);
    settings.updateSettings({ layout: { timerView: mode } });
  };

  let content: ReactNode;

  if (layoutMode === "maximal") {
    content = (
      <div className="relative flex flex-1 items-center justify-center">
        <TimerCard onOpenSettings={() => setSettingsOpen(true)} variant="maximal" />
        <button
          type="button"
          onClick={() => setMaximalPanelOpen((prev) => !prev)}
          className="absolute left-8 top-8 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg transition hover:bg-white/20"
          aria-label="Open controls"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div
          className={clsx(
            "pointer-events-none absolute inset-y-0 right-0 flex w-full max-w-[420px] justify-end transition duration-300",
            maximalPanelOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          )}
        >
          <div className="pointer-events-auto flex h-full max-h-[90vh] w-full flex-col rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-[0_30px_60px_rgba(15,20,60,0.45)] backdrop-blur-3xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={maximalPanelView === "tasks" ? "primary" : "secondary"}
                  onClick={() => setMaximalPanelView("tasks")}
                >
                  Tasks
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={maximalPanelView === "stats" ? "primary" : "secondary"}
                  onClick={() => setMaximalPanelView("stats")}
                >
                  Stats
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setMaximalPanelOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/20"
                aria-label="Close controls"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex-1 overflow-hidden">
              {maximalPanelView === "tasks" ? (
                <div className="h-full overflow-y-auto pr-2">
                  <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  <StatsMini variant="compact" />
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSettingsOpen(true);
                  setMaximalPanelOpen(false);
                }}
              >
                Settings
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setKeyboardOpen(true)}
              >
                Keyboard
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSidebarOpen(true);
                  setMaximalPanelOpen(false);
                }}
              >
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (layoutMode === "mini") {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <TimerMiniCard
          onOpenSettings={() => setSettingsOpen(true)}
          onExpand={(mode) => handleLayoutChange(mode)}
        />
        <p className="text-xs text-muted">Switch layouts above to return to other views.</p>
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

  const showChrome = !isMaximal || maximalPanelOpen;

  return (
    <div className="relative flex min-h-screen flex-col gap-4 p-4 md:gap-6 md:p-6 xl:p-8">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => {
          setSettingsOpen(true);
          setSidebarOpen(false);
        }}
      />
      <div className="flex w-full flex-1 flex-col gap-8">
        <header
          className={clsx(
            "flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between",
            showChrome ? 'opacity-100' : 'pointer-events-none opacity-0 duration-200',
          )}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold text-white">Pomodoro Peak</h1>
            <p className="text-sm text-slate-400">
              Have a great day. Stay mindful of your focus and your breaks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg transition hover:bg-white/20"
              aria-label="Open navigation"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <PresenceIndicator />
            <ThemeToggle />
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
                      "flex h-9 w-9 items-center justify-center rounded-md transition",
                      isActive
                        ? "bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[0_6px_16px_rgba(78,207,255,0.25)]"
                        : "text-slate-300 hover:text-white",
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
        <footer
          className={clsx(
            "text-center text-sm text-slate-700 transition",
            showChrome ? 'opacity-100' : 'pointer-events-none opacity-0 duration-200',
          )}
        >
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
      <KeyboardDialog open={keyboardOpen} onClose={() => setKeyboardOpen(false)} />
    </div>
  );
}
