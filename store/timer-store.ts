import { create } from "zustand";

type TimerState = {
  seconds: number;
  running: boolean;
  target: number;
  setTimer: (seconds: number) => void;
  tick: () => void;
  pause: () => void;
  reset: () => void;
};

export const useTimerStore = create<TimerState>((set, get) => ({
  seconds: 90,
  running: false,
  target: 90,
  setTimer: (seconds) => set({ seconds, target: seconds, running: true }),
  tick: () => {
    const { seconds, running } = get();
    if (running && seconds > 0) set({ seconds: seconds - 1 });
    if (running && seconds <= 1) set({ running: false });
  },
  pause: () => set((state) => ({ running: !state.running })),
  reset: () => set((state) => ({ seconds: state.target, running: false }))
}));
