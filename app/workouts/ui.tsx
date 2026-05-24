"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";
import { formatEnum } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  description: string;
  level: string;
  daysPerWeek: number;
  workouts: { id: string; name: string; durationMin: number; focus: string[]; exercises: { id: string }[] }[];
};

export function WorkoutsClient() {
  const { data, isLoading } = useQuery({ queryKey: ["plans"], queryFn: () => api<{ plans: Plan[] }>("/api/workouts") });

  if (isLoading) return <Skeleton className="h-[70vh] rounded-[2rem]" />;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">Structured plans</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Choose the rhythm that fits your week.</h1>
      </header>
      <div className="grid gap-5 xl:grid-cols-3">
        {data?.plans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <CardHeader>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Dumbbell className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold">{formatEnum(plan.level)}</span>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold">{plan.daysPerWeek} days/week</span>
              </div>
              <div className="space-y-2">
                {plan.workouts.map((workout) => (
                  <div key={workout.id} className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{workout.name}</p>
                      <span className="text-xs text-muted-foreground">{workout.durationMin} min</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{workout.exercises.length} exercises · {workout.focus.map(formatEnum).join(", ")}</p>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full">
                <Link href="/workouts/today"><Play className="h-4 w-4" /> Start today&apos;s workout</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
