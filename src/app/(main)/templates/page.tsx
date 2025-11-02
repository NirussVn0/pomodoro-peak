'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheckSquare } from 'react-icons/fi';
import { useAppSelector, useAppServices } from '../../../ui/context/app-context';

export default function TemplatesPage() {
  const templates = useAppSelector((state) => state.templates);
  const { templates: templateService, todo } = useAppServices();
  const [name, setName] = useState('');
  const [items, setItems] = useState('');

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lines = items
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title) => ({ title, tags: [], subtasks: [] }));
    const created = templateService.createTemplate(name, lines);
    if (created) {
      setName('');
      setItems('');
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 text-sm text-indigo-200 hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> Back to timer
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Templates</h1>
          <p className="text-sm text-slate-400">
            Craft repeatable task lists. Apply them from the home screen or right here.
          </p>
        </div>
      </header>
      <main className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">New template</h2>
          <p className="mt-1 text-sm text-slate-400">One task per line. You can always edit tags later.</p>
          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 text-sm text-slate-200">
            <label className="flex flex-col gap-1">
              <span>Template name</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-white focus:outline-none"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Deep work morning"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Tasks</span>
              <textarea
                className="min-h-[140px] rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-white focus:outline-none"
                value={items}
                onChange={(event) => setItems(event.target.value)}
                placeholder={['Outline plan', 'Focus sprint', 'Break ritual'].join('\n')}
              />
            </label>
            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-indigo-400 hover:to-purple-400"
            >
              <FiPlus className="h-4 w-4" /> Create template
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Your templates</h2>
          <ul className="mt-4 space-y-4">
            {templates.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-sm text-slate-400">
                No templates yet. Create one from your current task list or with the form on the left.
              </li>
            ) : (
              templates.map((template) => (
                <li key={template.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-xs text-slate-400">
                        {template.items.length} task{template.items.length === 1 ? '' : 's'} · saved{' '}
                        {new Date(template.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => todo.applyTemplate(template)}
                        className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
                      >
                        <FiCheckSquare className="h-4 w-4" /> Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => templateService.removeTemplate(template.id)}
                        className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-red-400/70 hover:text-red-200"
                      >
                        <FiTrash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {template.items.map((item, index) => (
                      <li key={`${template.id}-${index}`} className="rounded-xl border border-white/5 bg-slate-900/30 px-3 py-2">
                        <p className="font-medium text-white">{item.title}</p>
                        {item.subtasks.length > 0 ? (
                          <p className="text-xs text-slate-400">Subtasks: {item.subtasks.join(', ')}</p>
                        ) : null}
                        {item.tags.length > 0 ? (
                          <p className="text-xs text-slate-400">Tags: {item.tags.join(', ')}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
