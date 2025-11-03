"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { IconType } from "react-icons";
import { FiColumns, FiMaximize2, FiMinimize2, FiMenu, FiMoreHorizontal } from "react-icons/fi";
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
import { MaximalTimer } from "../../ui/components/maximal-timer";
import { MaximalSidebar } from "../../ui/components/maximal-sidebar";

const layoutOptions: { value: TimerViewMode; icon: IconType; label: string }[] = [
  { value: "split", icon: FiColumns, label: "Split view" },
  { value: "maximal", icon: FiMaximize2, label: "Maximal view" },
  { value: "mini", icon: FiMinimize2, label: "Mini view" },
];

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maximalSidebarOpen, setMaximalSidebarOpen] = useState(false);
  const taskInputRef = useRef<HTMLInputElement | null>(null);
  const maximalTaskInputRef = useRef<HTMLInputElement | null>(null);
  const miniWindowRef = useRef<Window | null>(null);
  const { templates, settings } = useAppServices();
  const layoutMode = useAppSelector((state) => state.settings.layout.timerView);
  const isMaximal = layoutMode === "maximal";

  const handleShortcutOpenSettings = useCallback(() => {
    if (layoutMode === "maximal") {
      setMaximalSidebarOpen((prev) => !prev);
    } else {
      setSettingsOpen(true);
    }
  }, [layoutMode]);

  const handleShortcutNewTask = useCallback(() => {
    if (layoutMode === "maximal") {
      setMaximalSidebarOpen(true);
      setTimeout(() => maximalTaskInputRef.current?.focus(), 120);
    } else {
      taskInputRef.current?.focus();
    }
  }, [layoutMode]);

  useKeyboardShortcuts({
    onOpenSettings: handleShortcutOpenSettings,
    onNewTask: handleShortcutNewTask,
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
        "width=420,height=520,menubar=no,toolbar=no,location=no,status=no,alwaysOnTop=yes,alwaysRaised=yes,popup=yes",
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
      if (mode !== "mini") {
        closeMiniWindow();
      }
      settings.updateSettings({ layout: { timerView: mode } });
    },
    [closeMiniWindow, settings],
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
    if (layoutMode !== "maximal") {
      setMaximalSidebarOpen(false);
    }
  }, [layoutMode]);

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

  if (layoutMode === "maximal") {
    return (
      <div className="relative flex min-h-screen flex-col bg-[color:var(--surface-page)] text-primary transition-colors">
        <MaximalSidebar
          open={maximalSidebarOpen}
          onClose={() => setMaximalSidebarOpen(false)}
          onOpenSettingsDialog={() => setSettingsOpen(true)}
          taskInputRef={maximalTaskInputRef}
        />
        <button
          type="button"
          onClick={() => setMaximalSidebarOpen(true)}
          className="fixed right-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] text-primary shadow-elevated transition hover:border-[color:var(--accent-ring)] hover:text-primary/80"
          aria-label="Open quick settings"
        >
          <FiMoreHorizontal className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <MaximalTimer />
        </div>
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  let content: ReactNode;

  if (layoutMode === "mini") {
    content = (
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] p-6 shadow-elevated">
          <h3 className="text-lg font-semibold text-primary">Mini timer mode</h3>
          <p className="mt-2 text-sm text-muted">
            Tap the clock to pop it out into a floating window. The timer stays in sync while you manage tasks here.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
            <TimerMiniCard
              onOpenSettings={() => setSettingsOpen(true)}
              onPopOut={openMiniWindow}
              onExpand={(mode) => handleLayoutChange(mode)}
            />
            <button
              type="button"
              onClick={openMiniWindow}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-solid)] px-4 py-2 text-sm font-medium text-[color:var(--text-inverse)] shadow-[0_10px_24px_rgba(124,58,237,0.35)] transition hover:bg-[color:var(--accent-solid-hover)]"
            >
              Reopen floating timer
            </button>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={taskInputRef} />
          <StatsMini />
        </div>
      </div>
    );
  } else {
    content = (
      <div className="grid flex-1 gap-6 xl:grid-cols-2">
        <TimerCard onOpenSettings={() => setSettingsOpen(true)} />
        <div className="flex flex-col gap-6">
          <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={taskInputRef} />
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
