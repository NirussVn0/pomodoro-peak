'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import { PlusIcon, TagIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAppSelector, useAppServices } from '../context/app-context';
import { Button } from './primitives/button';

interface TodoCardProps {
  readonly onCreateTemplate: () => void;
  readonly inputRef?: RefObject<HTMLInputElement>;
}

export const TodoCard = ({ onCreateTemplate, inputRef }: TodoCardProps) => {
  const { todo } = useAppServices();
  const tasks = useAppSelector((state) => state.tasks);
  const [taskTitle, setTaskTitle] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    todo.addTask(taskTitle);
    setTaskTitle('');
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      return;
    }
    const ids = tasks.map((task) => task.id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) {
      return;
    }
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, draggingId);
    todo.reorder(ids);
  };

  return (
    <section className="flex flex-1 flex-col gap-6 rounded-lg border border-subtle bg-surface-card p-6 shadow-elevated backdrop-blur-xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">To-do</p>
          <h2 className="text-2xl font-semibold text-primary">Plan the day</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCreateTemplate}
          className="w-full sm:w-auto"
        >
          Save as template
        </Button>
      </header>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-subtle bg-surface-overlay-soft px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <input
          ref={inputRef}
          className="w-full flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder="Quick add a task (N)"
          aria-label="Add task"
        />
        <Button
          type="submit"
          size="sm"
          icon={<PlusIcon className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add
        </Button>
      </form>
      <ul className="flex flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <li className="rounded-lg border border-dashed border-subtle bg-surface-overlay-soft px-4 py-8 text-center text-sm text-muted">
            No tasks yet. Add your first focus item!
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => setDraggingId(task.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(task.id);
              }}
              className={clsx(
                'group rounded-lg border border-subtle bg-surface-overlay-soft p-4 transition-colors',
                draggingId === task.id && 'border-[color:var(--accent-ring)]',
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => todo.toggleTask(task.id)}
                  className={clsx(
                    'mt-1 flex h-5 w-5 items-center justify-center rounded-md border text-xs font-semibold transition-colors',
                    task.completed
                      ? 'border-[color:var(--accent-ring)] bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)]'
                      : 'border-subtle text-muted hover:border-[color:var(--accent-ring)] hover:text-primary',
                  )}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? '✓' : ''}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      value={task.title}
                      onChange={(event) => todo.updateTitle(task.id, event.target.value)}
                      className="w-full bg-transparent text-base font-medium text-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => todo.removeTask(task.id)}
                      className="hidden rounded-lg border border-transparent p-2 text-muted transition hover:border-red-300/50 hover:text-red-400 group-hover:flex"
                      aria-label="Delete task"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <span className="hidden cursor-grab text-muted group-hover:block" aria-hidden>
                      <Bars3Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-2 rounded-lg border border-subtle bg-surface-card px-3 py-1 text-xs text-primary"
                      >
                        #{tag.label}
                        <button
                          type="button"
                          onClick={() => todo.removeTag(task.id, tag.id)}
                          className="text-muted transition hover:text-red-400"
                          aria-label={`Remove tag ${tag.label}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const value = window.prompt('Tag name');
                        if (value) {
                          todo.addTag(task.id, value);
                        }
                      }}
                      className="flex items-center gap-1 rounded-lg border border-subtle px-3 py-1 text-xs text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
                    >
                      <TagIcon className="h-3 w-3" />
                      Tag
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {task.subtasks.map((subtask) => (
                      <label key={subtask.id} className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => todo.toggleSubtask(task.id, subtask.id)}
                          className="h-4 w-4 rounded border-subtle bg-surface-card text-[color:var(--accent-solid)] focus:ring-[color:var(--accent-ring)]"
                        />
                        <span className={clsx('text-primary', subtask.completed && 'line-through text-muted')}>{subtask.title}</span>
                        <button
                          type="button"
                          onClick={() => todo.removeSubtask(task.id, subtask.id)}
                          className="ml-auto text-xs text-muted hover:text-red-400"
                        >
                          Remove
                        </button>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setExpandedTask((prev) => (prev === task.id ? null : task.id))}
                      className="text-xs text-muted hover:text-primary"
                    >
                      {expandedTask === task.id ? 'Hide subtasks' : 'Add subtask'}
                    </button>
                    {expandedTask === task.id ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          const title = String(formData.get('subtask') ?? '');
                          todo.addSubtask(task.id, title);
                          event.currentTarget.reset();
                        }}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center"
                      >
                        <input
                          name="subtask"
                          className="w-full flex-1 rounded-lg border border-subtle bg-surface-card px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none"
                          placeholder="Subtask title"
                        />
                        <Button type="submit" size="sm" className="w-full sm:w-auto">
                          Add
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};
