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
    <aside className="flex w-full flex-wrap items-center gap-4 rounded-lg border border-subtle bg-surface-card px-4 py-3 shadow-elevated backdrop-blur-xl sm:px-6 lg:h-full lg:w-24 lg:flex-col lg:items-center lg:gap-4 lg:px-2 lg:py-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-solid)] text-lg font-semibold text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]">
        PP
      </div>
      <nav className="flex flex-1 items-center justify-center gap-3 lg:flex-col lg:justify-start">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex h-12 w-12 items-center justify-center rounded-lg border border-subtle text-muted transition-colors hover:border-[color:var(--accent-ring)] hover:text-primary',
                isActive &&
                  'border-[color:var(--accent-ring)] bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]',
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
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-subtle text-muted transition-colors hover:border-[color:var(--accent-ring)] hover:text-primary"
        aria-label="Open settings"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-subtle text-muted transition-colors hover:border-[color:var(--accent-ring)] hover:text-primary"
        aria-label="Profile"
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>
    </aside>
  );
};
