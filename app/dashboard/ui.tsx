"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Flame, Play, Target, Trophy } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";
import { formatEnum } from "@/lib/utils";

type Today = { workout: { id: string; name: string; planName: string; durationMin: number; focus: string[]; exercises: { targetSets: number; exercise: { caloriesPerSet: number } }[] } };
type ProgressData = { metrics: { totalWorkouts: number; weeklyWorkouts: number; streak: number; calories: number }; progress: { date: string; totalVolume: number; bodyWeightKg?: number }[]; recent: { id: string; workout: { name: string }; durationSec: number; completedAt: string }[] };

export function DashboardClient() {
  const today = useQuery({ queryKey: ["today"], queryFn: () => api<Today>("/api/workouts/today") });
  const progress = useQuery({ queryKey: ["progress"], queryFn: () => api<ProgressData>("/api/progress") });

  if (today.isLoading || progress.isLoading) return <DashboardSkeleton />;

  const workout = today.data?.workout;
  const metrics = progress.data?.metrics;
  const completion = Math.min(100, ((metrics?.weeklyWorkouts ?? 0) / 4) * 100);
  const calories = workout?.exercises.reduce((sum, item) => sum + item.targetSets * item.exercise.caloriesPerSet, 0) ?? 0;

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-panel md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold text-primary">Today&apos;s session</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{workout?.name}</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              {workout?.planName} training, built around focused volume and progression you can log set by set.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {workout?.focus.map((focus) => (
                <span key={focus} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
                  {formatEnum(focus)}
                </span>
              ))}
            </div>
            <Button asChild size="lg" className="mt-7">
              <Link href="/workouts/today"><Play className="h-4 w-4" /> Quick start workout</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={Flame} label="Current streak" value={`${metrics?.streak ?? 0} days`} />
            <Metric icon={Trophy} label="Total workouts" value={`${metrics?.totalWorkouts ?? 0}`} />
            <Metric icon={Target} label="Week completion" value={`${Math.round(completion)}%`} />
            <Metric icon={Activity} label="Est. calories" value={`${calories}`} />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-end justify-between">
              <span className="text-4xl font-black">{metrics?.weeklyWorkouts ?? 0}/4</span>
              <span className="text-sm text-muted-foreground">sessions</span>
            </div>
            <Progress value={completion} />
            <p className="mt-4 text-sm text-muted-foreground">A four-session week is the target for sustainable strength and hypertrophy progress.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Training volume</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress.data?.progress ?? []}>
                <defs>
                  <linearGradient id="volume" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#4ef5ae" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#4ef5ae" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{ background: "#0b111a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="totalVolume" stroke="#4ef5ae" fill="url(#volume)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent workouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {progress.data?.recent.length ? (
            progress.data.recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div>
                  <p className="font-semibold">{item.workout.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(item.completedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{Math.round(item.durationSec / 60)} min</span>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-muted-foreground">Complete your first workout to populate progress history.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <Icon className="mb-5 h-5 w-5 text-primary" />
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-80 rounded-[2rem]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
