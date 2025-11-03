"use client";

import { useEffect } from "react";
import { MaximalTimer } from "../../ui/components/maximal-timer";

const sendMessage = (payload: unknown) => {
  if (typeof window === "undefined") {
    return;
  }
  window.opener?.postMessage(payload, "*");
};

export default function MiniTimerPage() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    document.title = "Pomodoro Mini";
    const anyWindow = window as unknown as { setAlwaysOnTop?: (flag: boolean) => void };
    anyWindow.setAlwaysOnTop?.(true);
    window.focus();
    const handleUnload = () => {
      sendMessage({ type: "pomodoro-layout", mode: "split" });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[color:var(--surface-page)] p-6">
      <MaximalTimer baseSize={280} scaleOverride={1} />
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
        <button
          type="button"
          onClick={() => sendMessage({ type: "pomodoro-open-settings" })}
          className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] px-3 py-2 text-[color:var(--text-primary)] transition hover:border-[color:var(--accent-ring)]"
        >
          Open settings
        </button>
        <button
          type="button"
          onClick={() => {
            sendMessage({ type: "pomodoro-layout", mode: "split" });
            if (typeof window !== "undefined") {
              window.close();
            }
          }}
          className="rounded-full border border-[color:var(--accent-ring)] bg-[color:var(--accent-solid)] px-3 py-2 text-[color:var(--text-inverse)] transition hover:bg-[color:var(--accent-solid-hover)]"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
