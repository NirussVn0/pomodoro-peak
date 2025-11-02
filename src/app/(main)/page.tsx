"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
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
import { useKeyboardShortcuts } from "../../ui/hooks/use-keyboard-shortcuts";
import { useAppServices, useAppSelector } from "../../ui/context/app-context";

const layoutOptions: { value: TimerViewMode; icon: IconType; label: string }[] = [
  { value: "split", icon: FiColumns, label: "Split view" },
  { value: "maximal", icon: FiMaximize2, label: "Maximal view" },
  { value: "mini", icon: FiMinimize2, label: "Mini view" },
];

const shortcutRows = [
  { key: "Space", action: "Start / Pause timer" },
  { key: "R", action: "Reset timer" },
  { key: "1", action: "Switch to focus" },
  { key: "2", action: "Switch to short break" },
  { key: "3", action: "Switch to long break" },
  { key: "P", action: "Cycle timer mode" },
  { key: "N", action: "Add new task" },
  { key: "S", action: "Open settings" },
  { key: "T", action: "Open templates" },
];

type PanelView = "tasks" | "stats" | "shortcuts";

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>("tasks");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { templates, settings } = useAppServices();
  const layoutSettings = useAppSelector((state) => state.settings.layout);
  const layoutMode = layoutSettings.timerView;
  const isMaximal = layoutMode === "maximal";
  const isMini = layoutMode === "mini";

  useKeyboardShortcuts({
    onOpenSettings: () => setSettingsOpen(true),
    onNewTask: () => {
      inputRef.current?.focus();
    },
  });

  const handleCreateTemplate = useCallback(() => {
    const name = window.prompt("Template name");
    if (!name) {
      return;
    }
    templates.createFromCurrentTasks(name);
  }, [templates]);

  const handleLayoutChange = (mode: TimerViewMode) => {
    setPanelOpen(false);
    settings.updateSettings({ layout: { ...layoutSettings, timerView: mode } });
  };

  const panelContent: ReactNode = useMemo(() => {
    if (panelView === "stats") {
      return <StatsMini variant="compact" />;
    }
    if (panelView === "shortcuts") {
      return (
        <div className="grid gap-3 text-sm text-white">
          {shortcutRows.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
            >
              <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white">
                {item.key}
              </span>
              <span className="text-white/70">{item.action}</span>
            </div>
          ))}
        </div>
      );
    }
    return <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />;
  }, [panelView, handleCreateTemplate]);

  let content: ReactNode;

  if (isMaximal) {
    content = (
      <div className="relative flex flex-1 items-center justify-center">
        <TimerCard onOpenSettings={() => setPanelOpen(true)} variant="maximal" />
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="absolute right-10 top-10 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-[0_18px_38px_rgba(10,15,45,0.45)] transition hover:bg-white/25"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <MaximalPanel
          open={panelOpen}
          view={panelView}
          onChangeView={setPanelView}
          onClose={() => setPanelOpen(false)}
          onOpenNavigation={() => setSidebarOpen(true)}
        >
          {panelContent}
        </MaximalPanel>
      </div>
    );
  } else if (isMini) {
    content = (
      <div className="flex flex-1 flex-col items-center gap-10">
        <TimerMiniCard onOpenSettings={() => setSettingsOpen(true)} onExpand={(mode) => handleLayoutChange(mode)} />
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300 shadow-lg">
          Mini view keeps controls ultra light. Open the settings menu to return to the full dashboard.
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

  const showChrome = !isMaximal;

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
        {showChrome ? (
          <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
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
        ) : null}
        {content}
        {showChrome ? (
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
        ) : null}
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

const panelOptions: { id: PanelView; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "stats", label: "Stats" },
  { id: "shortcuts", label: "Shortcuts" },
];

function MaximalPanel({
  open,
  view,
  onChangeView,
  onClose,
  onOpenNavigation,
  children,
}: {
  readonly open: boolean;
  readonly view: PanelView;
  readonly onChangeView: (view: PanelView) => void;
  readonly onClose: () => void;
  readonly onOpenNavigation: () => void;
  readonly children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-y-0 right-0 flex w-full max-w-[420px] justify-end transition-transform duration-300",
        open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className="pointer-events-auto flex h-full max-h-[92vh] w-full flex-col rounded-3xl border border-white/15 bg-white/12 p-6 text-white shadow-[0_35px_120px_rgba(10,15,45,0.55)] backdrop-blur-3xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {panelOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChangeView(option.id)}
                className={clsx(
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  view === option.id ? "bg-white text-black shadow" : "bg-white/10 text-white/70 hover:bg-white/20",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenNavigation();
                onClose();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20"
              aria-label="Open navigation"
            >
              <FiMenu className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20"
              aria-label="Close panel"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
