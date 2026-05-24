"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, ExternalLink, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RestTimer } from "@/components/rest-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";
import { formatEnum, youtubeEmbed } from "@/lib/utils";
import { useTimerStore } from "@/store/timer-store";

type SetLog = { exerciseId: string; setNumber: number; reps: number; weightKg: number; completed: boolean };
type WorkoutExercise = {
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  exercise: { id: string; name: string; muscleGroup: string; difficulty: string; equipment: string; instructions: string; youtubeUrl: string };
};
type Today = {
  workout: { id: string; name: string; planName: string; durationMin: number; focus: string[]; exercises: WorkoutExercise[] };
  activeHistory?: { id: string; startedAt: string; logs: SetLog[] } | null;
};

export function WorkoutLogger() {
  const qc = useQueryClient();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [localLogs, setLocalLogs] = useState<Record<string, SetLog>>({});
  const setTimer = useTimerStore((state) => state.setTimer);
  const { data, isLoading } = useQuery({ queryKey: ["today"], queryFn: () => api<Today>("/api/workouts/today") });

  const start = useMutation({
    mutationFn: (workoutId: string) => api<{ history: { id: string; startedAt: string } }>("/api/workouts/start", { method: "POST", body: JSON.stringify({ workoutId }) }),
    onSuccess: () => {
      toast.success("Workout started.");
      setStartedAt(Date.now());
      qc.invalidateQueries({ queryKey: ["today"] });
    }
  });

  const logSet = useMutation({
    mutationFn: (payload: SetLog & { historyId: string }) => api("/api/workouts/log-set", { method: "POST", body: JSON.stringify(payload) }),
    onMutate: async (payload) => {
      setLocalLogs((prev) => ({ ...prev, [`${payload.exerciseId}-${payload.setNumber}`]: payload }));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Set was not saved")
  });

  const complete = useMutation({
    mutationFn: (payload: { historyId: string; durationSec: number }) => api("/api/workouts/complete", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success("Workout complete. Progress updated.");
      qc.invalidateQueries();
    }
  });

  useEffect(() => {
    if (data?.activeHistory?.logs) {
      const logs = Object.fromEntries(data.activeHistory.logs.map((log) => [`${log.exerciseId}-${log.setNumber}`, log]));
      setLocalLogs(logs);
      setStartedAt(new Date(data.activeHistory.startedAt).getTime());
    }
  }, [data?.activeHistory]);

  const historyId = data?.activeHistory?.id;
  const totalSets = data?.workout.exercises.reduce((sum, item) => sum + item.targetSets, 0) ?? 0;
  const completedSets = useMemo(() => Object.values(localLogs).filter((log) => log.completed).length, [localLogs]);
  const completion = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  if (isLoading) return <Skeleton className="h-[80vh] rounded-[2rem]" />;
  if (!data?.workout) return null;

  function updateLog(exerciseId: string, setNumber: number, patch: Partial<SetLog>) {
    const key = `${exerciseId}-${setNumber}`;
    const existing = localLogs[key] ?? { exerciseId, setNumber, reps: 0, weightKg: 0, completed: false };
    setLocalLogs((prev) => ({ ...prev, [key]: { ...existing, ...patch } }));
  }

  function saveSet(item: WorkoutExercise, setNumber: number) {
    if (!historyId) return toast.error("Start the workout first.");
    const key = `${item.exercise.id}-${setNumber}`;
    const log = localLogs[key] ?? { exerciseId: item.exercise.id, setNumber, reps: parseInt(item.targetReps) || 8, weightKg: 0, completed: true };
    logSet.mutate({ ...log, completed: true, historyId });
    setTimer(item.restSeconds);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 md:p-8">
        <p className="text-sm font-semibold text-primary">{data.workout.planName}</p>
        <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{data.workout.name}</h1>
            <p className="mt-3 text-muted-foreground">{data.workout.durationMin} min · {data.workout.focus.map(formatEnum).join(", ")}</p>
          </div>
          {historyId ? (
            <Button
              size="lg"
              disabled={complete.isPending || completion < 100}
              onClick={() => complete.mutate({ historyId, durationSec: Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000) })}
            >
              <Check className="h-4 w-4" />
              Finish workout
            </Button>
          ) : (
            <Button size="lg" onClick={() => start.mutate(data.workout.id)} disabled={start.isPending}>
              Start session
            </Button>
          )}
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>{completedSets}/{totalSets} sets complete</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} />
        </div>
      </section>

      <div className="grid gap-5">
        {data.workout.exercises.map((item, index) => (
          <motion.div key={item.exercise.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <CardTitle className="text-2xl">{item.exercise.name}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{item.exercise.instructions}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white/8 px-3 py-1">{formatEnum(item.exercise.muscleGroup)}</span>
                      <span className="rounded-full bg-white/8 px-3 py-1">{formatEnum(item.exercise.difficulty)}</span>
                      <span className="rounded-full bg-white/8 px-3 py-1">{item.exercise.equipment}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1"><Timer className="h-3 w-3" /> {item.restSeconds}s</span>
                    </div>
                  </div>
                  <a className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href={item.exercise.youtubeUrl} target="_blank" rel="noreferrer">
                    Open demo <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <iframe className="h-full w-full" src={youtubeEmbed(item.exercise.youtubeUrl)} title={`${item.exercise.name} demo`} allowFullScreen />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: item.targetSets }, (_, setIndex) => {
                    const setNumber = setIndex + 1;
                    const key = `${item.exercise.id}-${setNumber}`;
                    const log = localLogs[key];
                    return (
                      <div key={key} className="grid grid-cols-[2.8rem_1fr_1fr_3.2rem] items-center gap-2 rounded-xl bg-white/5 p-2">
                        <span className="text-center text-sm font-bold text-muted-foreground">#{setNumber}</span>
                        <Input type="number" min={0} placeholder={`Reps ${item.targetReps}`} value={log?.reps ?? ""} onChange={(e) => updateLog(item.exercise.id, setNumber, { reps: Number(e.target.value) })} />
                        <Input type="number" min={0} step="0.5" placeholder="kg" value={log?.weightKg ?? ""} onChange={(e) => updateLog(item.exercise.id, setNumber, { weightKg: Number(e.target.value) })} />
                        <Button size="icon" variant={log?.completed ? "default" : "outline"} onClick={() => saveSet(item, setNumber)} aria-label={`Save set ${setNumber}`}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <RestTimer />
    </div>
  );
}
