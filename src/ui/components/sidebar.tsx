'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClockIcon,
  Cog6ToothIcon,
  RectangleGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface SidebarProps {
  readonly onOpenSettings: () => void;
}

const navItems = [
  { href: '/', icon: ClockIcon, label: 'Timer' },
  { href: '/templates', icon: RectangleGroupIcon, label: 'Templates' },
];

export const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-20 flex-col items-center gap-4 bg-white/5 py-6 shadow-lg backdrop-blur-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-semibold text-white shadow-lg">
        PP
      </div>
      <nav className="flex flex-1 flex-col items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-indigo-400/70 hover:text-white',
                isActive &&
                  'bg-gradient-to-br from-indigo-500/90 to-purple-500/90 text-white shadow-xl shadow-indigo-500/40',
              )}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-indigo-400/70 hover:text-white"
        aria-label="Open settings"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-indigo-400/70 hover:text-white"
        aria-label="Profile"
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>
    </aside>
  );
};
