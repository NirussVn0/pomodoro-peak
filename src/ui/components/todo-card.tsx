'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import { PlusIcon, TagIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAppSelector, useAppServices } from '../context/app-context';

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
    <section className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">To-do</p>
          <h2 className="text-2xl font-semibold text-white">Plan the day</h2>
        </div>
        <button
          type="button"
          onClick={onCreateTemplate}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
        >
          Save as template
        </button>
      </header>
      <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-3">
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder="Quick add a task (N)"
          aria-label="Add task"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-indigo-400 hover:to-purple-400"
        >
          <PlusIcon className="h-4 w-4" />
          Add
        </button>
      </form>
      <ul className="flex flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 px-4 py-8 text-center text-sm text-slate-400">
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
                'group rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition',
                draggingId === task.id && 'border-indigo-400/70 bg-slate-900/70',
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => todo.toggleTask(task.id)}
                  className={clsx(
                    'mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold transition',
                    task.completed
                      ? 'border-indigo-400 bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                      : 'border-white/20 text-slate-400 hover:border-indigo-400/70 hover:text-white',
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
                      className="w-full bg-transparent text-base font-medium text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => todo.removeTask(task.id)}
                      className="hidden rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-red-400/60 hover:text-red-300 group-hover:flex"
                      aria-label="Delete task"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <span className="hidden cursor-grab text-slate-500 group-hover:block" aria-hidden>
                      <Bars3Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200"
                      >
                        #{tag.label}
                        <button
                          type="button"
                          onClick={() => todo.removeTag(task.id, tag.id)}
                          className="text-indigo-200/80 hover:text-white"
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
                      className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-400/80 hover:text-white"
                    >
                      <TagIcon className="h-3 w-3" />
                      Tag
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {task.subtasks.map((subtask) => (
                      <label key={subtask.id} className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => todo.toggleSubtask(task.id, subtask.id)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent"
                        />
                        <span className={clsx(subtask.completed && 'line-through text-slate-500')}>{subtask.title}</span>
                        <button
                          type="button"
                          onClick={() => todo.removeSubtask(task.id, subtask.id)}
                          className="ml-auto text-xs text-slate-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setExpandedTask((prev) => (prev === task.id ? null : task.id))}
                      className="text-xs text-indigo-200 hover:text-white"
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
                        className="flex items-center gap-2"
                      >
                        <input
                          name="subtask"
                          className="flex-1 rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                          placeholder="Subtask title"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-indigo-500/80 px-3 py-1 text-xs text-white hover:bg-indigo-400"
                        >
                          Add
                        </button>
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
