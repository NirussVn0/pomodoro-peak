'use client';

import { useRef, useState } from 'react';
import { Sidebar } from '../../ui/components/sidebar';
import { TimerCard } from '../../ui/components/timer-card';
import { TodoCard } from '../../ui/components/todo-card';
import { StatsMini } from '../../ui/components/stats-mini';
import { ThemeToggle } from '../../ui/components/theme-toggle';
import { BackgroundMenu } from '../../ui/components/background-menu';
import { SettingsDialog } from '../../ui/components/settings-dialog';
import { useKeyboardShortcuts } from '../../ui/hooks/use-keyboard-shortcuts';
import { useAppServices } from '../../ui/context/app-context';

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { templates } = useAppServices();

  useKeyboardShortcuts({
    onOpenSettings: () => setSettingsOpen(true),
    onNewTask: () => {
      inputRef.current?.focus();
    },
  });

  const handleCreateTemplate = () => {
    const name = window.prompt('Template name');
    if (!name) {
      return;
    }
    templates.createFromCurrentTasks(name);
  };

  return (
    <div className="flex min-h-screen gap-6 p-4 md:p-8">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex w-full flex-1 flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold text-white">Pomodoro Peak</h1>
            <p className="text-sm text-slate-400">Have a great day! Stay mindful of your focus and your breaks.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <BackgroundMenu />
          </div>
        </header>
        <div className="grid flex-1 gap-6 xl:grid-cols-2">
          <TimerCard onOpenSettings={() => setSettingsOpen(true)} />
          <div className="flex flex-col gap-6">
            <TodoCard onCreateTemplate={handleCreateTemplate} inputRef={inputRef} />
            <StatsMini />
          </div>
        </div>
        <footer className="text-center text-sm text-slate-400">Take a deep breath. You are doing great.</footer>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
