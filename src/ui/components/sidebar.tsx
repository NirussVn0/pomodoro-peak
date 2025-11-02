'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiClock, FiSettings, FiLayers, FiUser, FiX } from 'react-icons/fi';
import { clsx } from 'clsx';

interface SidebarProps {
  readonly onOpenSettings: () => void;
  readonly open: boolean;
  readonly onClose: () => void;
}

const navItems = [
  { href: '/', icon: FiClock, label: 'Timer' },
  { href: '/templates', icon: FiLayers, label: 'Templates' },
];

const activeNavClasses =
  'border-[color:var(--accent-ring)] bg-[color:var(--accent-solid)] text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]';

export const Sidebar = ({ onOpenSettings, open, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed left-4 top-4 z-50 flex w-72 max-w-[90vw] flex-col gap-5 rounded-2xl border border-subtle bg-surface-card p-5 shadow-elevated backdrop-blur-xl transition-transform duration-300',
          open ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+3rem)] opacity-0',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[color:var(--accent-solid)] text-lg font-semibold text-[color:var(--text-inverse)] shadow-[var(--shadow-elevated)]">
            SOV
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Close navigation"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border border-subtle px-3 py-2 text-sm font-medium text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary',
                  isActive && activeNavClasses,
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-subtle px-3 py-2 text-sm text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Open settings"
          >
            <FiSettings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle text-muted transition hover:border-[color:var(--accent-ring)] hover:text-primary"
            aria-label="Profile"
          >
            <FiUser className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
};
