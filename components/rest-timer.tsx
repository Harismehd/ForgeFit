"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer-store";

export function RestTimer() {
  const { seconds, running, tick, pause, reset } = useTimerStore();
  useEffect(() => {
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-panel backdrop-blur-xl md:bottom-6">
      <span className="px-3 font-mono text-lg font-black text-primary">{minutes}:{secs}</span>
      <Button size="icon" variant="secondary" onClick={pause} aria-label={running ? "Pause rest timer" : "Start rest timer"}>
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={reset} aria-label="Reset rest timer">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
