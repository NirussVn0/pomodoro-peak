"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { IconType } from "react-icons";
import { FiColumns, FiMaximize2, FiMinimize2, FiMenu } from "react-icons/fi";
import type { TimerViewMode } from "../../domain/value-objects/settings";
import { Sidebar } from "../../ui/components/sidebar";
import { TimerCard } from "../../ui/components/timer-card";
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

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const miniWindowRef = useRef<Window | null>(null);
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

  const openMiniWindow = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!miniWindowRef.current || miniWindowRef.current.closed) {
      miniWindowRef.current = window.open(
        "/mini",
        "pomodoro-mini",
        "width=420,height=520,menubar=no,toolbar=no,location=no,status=no",
      );
    }
    miniWindowRef.current?.focus();
  }, []);

  const closeMiniWindow = useCallback(() => {
    if (miniWindowRef.current && !miniWindowRef.current.closed) {
      miniWindowRef.current.close();
    }
    miniWindowRef.current = null;
  }, []);

  const handleLayoutChange = useCallback(
    (mode: TimerViewMode) => {
      if (mode === "mini") {
        openMiniWindow();
      } else {
        closeMiniWindow();
      }
      settings.updateSettings({ layout: { timerView: mode } });
    },
    [closeMiniWindow, openMiniWindow, settings],
  );

  useEffect(() => {
    if (layoutMode !== "mini") {
      closeMiniWindow();
    }
    return () => {
      closeMiniWindow();
    };
  }, [closeMiniWindow, layoutMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; mode?: TimerViewMode } | undefined;
      if (!data || !data.type) {
        return;
      }
      if (data.type === "pomodoro-layout" && data.mode) {
        handleLayoutChange(data.mode);
        if (data.mode !== "mini") {
          window.focus();
        }
      }
      if (data.type === "pomodoro-open-settings") {
        setSettingsOpen(true);
        window.focus();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleLayoutChange]);

  let content: ReactNode;

  if (layoutMode === "maximal") {
    content = (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="group flex h-full flex-1 items-center justify-center">
          <TimerCard onOpenSettings={() => setSettingsOpen(true)} variant="maximal" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="pointer-events-auto absolute left-4 top-4 z-10 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg transition hover:bg-white/20"
                aria-label="Toggle navigation"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <StatsMini />
              </div>
            </div>
            <div className="pointer-events-auto absolute right-4 top-1/2 h-[70%] w-[420px] -translate-y-1/2 rounded-3xl border border-white/10 bg-white/10 p-4">
              <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (layoutMode === "mini") {
    content = (
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white">Mini timer mode</h3>
          <p className="mt-2 text-sm text-slate-300">
            The timer is running in a separate mini window. Keep this page open for tasks and stats. If the window
            closed, you can relaunch it below.
          </p>
          <button
            type="button"
            onClick={openMiniWindow}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[color:var(--accent-solid)] px-4 py-2 text-sm font-medium text-[color:var(--text-inverse)] shadow-[0_10px_24px_rgba(78,207,255,0.35)] transition hover:bg-[color:var(--accent-solid-hover)]"
          >
            Reopen mini timer
          </button>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
          <StatsMini />
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
    <div
      className={clsx(
        "relative flex min-h-screen flex-col gap-4 p-4 md:gap-6 md:p-6 xl:p-8",
        isMaximal && "group",
      )}
    >
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
            "flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl transition md:flex-row md:items-center md:justify-between",
            isMaximal && "pointer-events-none opacity-0 duration-200 group-hover:pointer-events-auto group-hover:opacity-100",
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
        <footer
          className={clsx(
            "text-center text-sm text-slate-700 transition",
            isMaximal && "pointer-events-none opacity-0 duration-200 group-hover:pointer-events-auto group-hover:opacity-100",
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
    </div>
  );
}
