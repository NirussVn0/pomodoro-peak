"use client";

import { useEffect } from "react";
import { TimerMiniCard } from "../../ui/components/timer-card";

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
    const handleUnload = () => {
      sendMessage({ type: "pomodoro-layout", mode: "split" });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--surface-page)] p-4">
      <TimerMiniCard
        onOpenSettings={() => {
          sendMessage({ type: "pomodoro-open-settings" });
        }}
        onExpand={(mode) => {
          sendMessage({ type: "pomodoro-layout", mode });
          if (typeof window !== "undefined") {
            window.close();
          }
        }}
      />
    </div>
  );
}
