'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface KeyboardDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const shortcuts = [
  { key: 'Space', action: 'Start / Pause timer' },
  { key: 'R', action: 'Reset timer' },
  { key: '1', action: 'Switch to focus' },
  { key: '2', action: 'Switch to short break' },
  { key: '3', action: 'Switch to long break' },
  { key: 'P', action: 'Cycle timer mode' },
  { key: 'N', action: 'Add new task' },
  { key: 'S', action: 'Open settings' },
  { key: 'T', action: 'Open templates' },
];

export const KeyboardDialog = ({ open, onClose }: KeyboardDialogProps) => (
  <Transition show={open} as={Fragment}>
    <Dialog onClose={onClose} className="relative z-50">
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto px-4 py-10">
        <div className="mx-auto max-w-lg">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-3"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-3"
          >
            <Dialog.Panel className="rounded-2xl border border-subtle bg-surface-card p-8 shadow-elevated backdrop-blur-xl">
              <Dialog.Title className="text-2xl font-semibold text-primary">Keyboard shortcuts</Dialog.Title>
              <div className="mt-6 grid gap-3 text-sm text-primary">
                {shortcuts.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-subtle bg-surface-overlay-soft px-4 py-3"
                  >
                    <span className="rounded-lg border border-subtle bg-surface-card px-3 py-1 font-semibold">
                      {item.key}
                    </span>
                    <span className="text-muted">{item.action}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-subtle bg-surface-overlay-soft px-4 py-2 text-sm font-medium text-primary transition hover:border-[color:var(--accent-ring)] hover:text-primary"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
