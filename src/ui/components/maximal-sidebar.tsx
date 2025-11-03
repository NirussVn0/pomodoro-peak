'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type FormEvent, type RefObject } from 'react';
import {
  FiCheckCircle,
  FiPlus,
  FiSettings,
  FiTarget,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { useAppSelector, useAppServices } from '../context/app-context';

interface MaximalSidebarProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onOpenSettingsDialog: () => void;
  readonly taskInputRef: RefObject<HTMLInputElement | null>;
}

const shortcuts = [
  { key: 'Space', label: 'Start / pause timer' },
  { key: 'R', label: 'Reset timer' },
  { key: '1 · 2 · 3', label: 'Switch focus / breaks' },
  { key: 'N', label: 'Quick add task' },
  { key: 'S', label: 'Toggle sidebar' },
];

export const MaximalSidebar = ({
  open,
  onClose,
  onOpenSettingsDialog,
  taskInputRef,
}: MaximalSidebarProps) => {
  const { todo, settings } = useAppServices();
  const tasks = useAppSelector((state) => state.tasks);
  const activeTaskId = useAppSelector((state) => state.activeTaskId);
  const scaleSetting = useAppSelector((state) => state.settings.layout.maximalClockScale ?? 1);
  const [taskTitle, setTaskTitle] = useState('');

  useEffect(() => {
    if (open) {
      const focusHandle = window.requestAnimationFrame(() => {
        taskInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(focusHandle);
    }
    return undefined;
  }, [open, taskInputRef]);

  useEffect(() => {
    if (!open) {
      setTaskTitle('');
    }
  }, [open]);

  const handleScaleChange = (value: number) => {
    const clamped = Math.min(1.5, Math.max(0.7, value));
    settings.updateSettings({ layout: { maximalClockScale: clamped } });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    todo.addTask(taskTitle);
    setTaskTitle('');
  };

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed bottom-4 right-4 top-4 z-50 flex w-full max-w-[380px] flex-col gap-6 rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] p-6 shadow-elevated backdrop-blur-xl transition-transform duration-300',
          open ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+4rem)] opacity-0',
        )}
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Controls</p>
            <h2 className="text-lg font-semibold text-primary">Workspace quick panel</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Close sidebar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <section className="space-y-4 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay-soft)] p-4">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">Clock size</h3>
            <span className="text-xs text-muted">{Math.round(scaleSetting * 100)}%</span>
          </header>
          <input
            type="range"
            min={0.7}
            max={1.5}
            step={0.05}
            value={scaleSetting}
            onChange={(event) => handleScaleChange(Number(event.target.value))}
            className="w-full accent-[color:var(--accent-solid)]"
            aria-label="Resize maximal clock"
          />
        </section>

        <section className="space-y-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay-soft)] p-4">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">Keyboard shortcuts</h3>
            <button
              type="button"
              onClick={onOpenSettingsDialog}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            >
              <FiSettings className="h-4 w-4" />
              Advanced settings
            </button>
          </header>
          <ul className="space-y-2 text-sm">
            {shortcuts.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] px-3 py-2"
              >
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
                  {item.key}
                </span>
                <span className="text-primary">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1 overflow-y-auto rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay-soft)] p-4">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-primary">Tasks</h3>
            <span className="text-xs text-muted">{tasks.length} total</span>
          </header>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              ref={taskInputRef}
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add a task"
              className="flex-1 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl border border-transparent bg-[color:var(--accent-solid)] px-3 py-2 text-sm font-medium text-[color:var(--text-inverse)] shadow-[0_10px_24px_rgba(124,58,237,0.35)] transition hover:bg-[color:var(--accent-solid-hover)]"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </form>
          <ul className="mt-4 space-y-3">
            {tasks.length === 0 ? (
              <li className="rounded-xl border border-dashed border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] px-3 py-6 text-center text-sm text-muted">
                No tasks yet — add your first focus item.
              </li>
            ) : (
              tasks.map((task) => {
                const isActive = task.id === activeTaskId;
                return (
                  <li
                    key={task.id}
                    className={clsx(
                      'rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] p-3 transition',
                      isActive && 'border-[color:var(--accent-ring)] shadow-[0_12px_32px_rgba(124,58,237,0.18)]',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => todo.toggleTask(task.id)}
                        className={clsx(
                          'mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 transition hover:border-[color:var(--accent-ring)] hover:text-primary',
                          task.completed
                            ? 'border-transparent bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[0_10px_22px_rgba(124,58,237,0.35)]'
                            : 'border-[color:var(--border-subtle)] text-muted',
                        )}
                        aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                      >
                        {task.completed ? <FiCheckCircle className="h-4 w-4" /> : null}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            value={task.title}
                            onChange={(event) => todo.updateTitle(task.id, event.target.value)}
                            className={clsx(
                              'flex-1 bg-transparent text-sm font-medium text-primary focus:outline-none',
                              task.completed && 'text-muted line-through',
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => todo.focusTask(task.id)}
                            className={clsx(
                              'flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-muted transition hover:text-primary',
                              isActive && 'text-[color:var(--accent-solid)]',
                            )}
                            aria-label="Set as focus task"
                          >
                            <FiTarget className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => todo.removeTask(task.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-red-200/40 hover:text-red-400"
                            aria-label="Delete task"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {task.subtasks.length > 0 ? (
                          <ul className="mt-3 space-y-2">
                            {task.subtasks.map((subtask) => (
                              <li key={subtask.id}>
                                <label className="flex items-center gap-2 text-xs text-muted">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => todo.toggleSubtask(task.id, subtask.id)}
                                    className="h-4 w-4 rounded border-[color:var(--border-subtle)] text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                                  />
                                  <span
                                    className={clsx(
                                      'flex-1 truncate text-primary',
                                      subtask.completed && 'text-muted line-through',
                                    )}
                                  >
                                    {subtask.title}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </aside>
    </>
  );
};
