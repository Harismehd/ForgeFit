"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Weight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";

type History = { id: string; startedAt: string; completedAt?: string; durationSec: number; workout: { name: string }; logs: { reps: number; weightKg: number; completed: boolean; exercise: { name: string } }[] };

export function HistoryClient() {
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => api<{ history: History[] }>("/api/history") });
  if (isLoading) return <Skeleton className="h-[70vh] rounded-[2rem]" />;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">Workout history</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Every completed session compounds.</h1>
      </header>
      <div className="space-y-4">
        {data?.history.length ? data.history.map((item) => {
          const volume = item.logs.reduce((sum, log) => sum + log.reps * log.weightKg, 0);
          return (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-bold">{item.workout.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(item.startedAt).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {Math.round(item.durationSec / 60)} min</span>
                      <span className="inline-flex items-center gap-1"><Weight className="h-4 w-4" /> {Math.round(volume)} kg volume</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">{item.logs.filter((log) => log.completed).length} sets</span>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card><CardContent className="p-6 text-muted-foreground">No completed workouts yet. Start today&apos;s workout and your history will appear here.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
