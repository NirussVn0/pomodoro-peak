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

const iconButtonClasses =
  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-subtle text-muted transition-colors hover:border-[color:var(--accent-ring)] hover:text-primary';

const activeNavClasses =
  'border-[color:var(--accent-ring)] bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]';

export const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-nowrap items-center gap-3 overflow-x-auto rounded-lg border border-subtle bg-surface-card px-3 py-2 shadow-elevated backdrop-blur-xl sm:gap-4 sm:px-4 sm:py-3 xl:h-full xl:w-24 xl:flex-col xl:items-center xl:gap-4 xl:overflow-visible xl:px-2 xl:py-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-solid)] text-lg font-semibold text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]">
        PP
      </div>
      <nav className="flex flex-1 shrink-0 min-w-max items-center justify-center gap-3 xl:flex-1 xl:shrink xl:flex-col xl:justify-start xl:gap-4 xl:min-w-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('group', iconButtonClasses, isActive && activeNavClasses)}
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
        className={iconButtonClasses}
        aria-label="Open settings"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        className={iconButtonClasses}
        aria-label="Profile"
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>
    </aside>
  );
};
