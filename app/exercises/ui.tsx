"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";
import { formatEnum } from "@/lib/utils";

type Exercise = { id: string; name: string; muscleGroup: string; difficulty: string; equipment: string; instructions: string; youtubeUrl: string };
const muscleGroups = ["", "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "LEGS", "GLUTES", "CORE"];
const difficulties = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

export function ExercisesClient() {
  const [q, setQ] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const url = useMemo(() => `/api/exercises?q=${encodeURIComponent(q)}&muscleGroup=${muscleGroup}&difficulty=${difficulty}`, [q, muscleGroup, difficulty]);
  const { data, isLoading } = useQuery({ queryKey: ["exercises", q, muscleGroup, difficulty], queryFn: () => api<{ exercises: Exercise[] }>(url) });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">Exercise library</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Search form, muscle, and difficulty.</h1>
      </header>
      <div className="grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="focus-ring h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm" value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}>
          {muscleGroups.map((value) => <option className="bg-slate-950" key={value} value={value}>{value ? formatEnum(value) : "All muscles"}</option>)}
        </select>
        <select className="focus-ring h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {difficulties.map((value) => <option className="bg-slate-950" key={value} value={value}>{value ? formatEnum(value) : "All levels"}</option>)}
        </select>
      </div>
      {isLoading ? <Skeleton className="h-96 rounded-2xl" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">{exercise.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{formatEnum(exercise.muscleGroup)} · {formatEnum(exercise.difficulty)}</p>
                  </div>
                  <a className="rounded-lg bg-white/8 p-2 text-primary transition hover:bg-white/12" href={exercise.youtubeUrl} target="_blank" rel="noreferrer" aria-label={`Open ${exercise.name} video`}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{exercise.instructions}</p>
                <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold">{exercise.equipment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
