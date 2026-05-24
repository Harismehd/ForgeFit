"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client-api";

type User = { name: string; email: string; weightKg?: number; heightCm?: number; goal: string; experienceLevel: string; workoutPreference: string; profileImageUrl?: string };
const goals = ["BUILD_MUSCLE", "LOSE_FAT", "GET_STRONGER", "IMPROVE_ENDURANCE", "GENERAL_FITNESS"];
const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const preferences = ["GYM", "HOME", "HYBRID"];

export function ProfileClient() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => api<{ user: User }>("/api/auth/me") });
  const { register, handleSubmit, reset, formState } = useForm<User>();
  const save = useMutation({
    mutationFn: (values: User) => api("/api/profile", { method: "PUT", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Profile could not be saved")
  });

  useEffect(() => {
    if (data?.user) reset(data.user);
  }, [data?.user, reset]);

  if (isLoading) return <Skeleton className="h-[70vh] rounded-[2rem]" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">Profile</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Personalize your training inputs.</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Member details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => save.mutate(values))} className="grid gap-4 md:grid-cols-2">
            <Field label="Name"><Input {...register("name", { required: true })} /></Field>
            <Field label="Email"><Input disabled {...register("email")} /></Field>
            <Field label="Weight (kg)"><Input type="number" step="0.1" {...register("weightKg", { valueAsNumber: true })} /></Field>
            <Field label="Height (cm)"><Input type="number" step="0.1" {...register("heightCm", { valueAsNumber: true })} /></Field>
            <Field label="Goal"><Select options={goals} register={register("goal")} /></Field>
            <Field label="Experience"><Select options={levels} register={register("experienceLevel")} /></Field>
            <Field label="Workout preference"><Select options={preferences} register={register("workoutPreference")} /></Field>
            <Field label="Profile image URL"><Input placeholder="https://..." {...register("profileImageUrl")} /></Field>
            <Button disabled={formState.isSubmitting || save.isPending} className="md:col-span-2" size="lg">
              {save.isPending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function Select({ options, register }: { options: string[]; register: ReturnType<typeof useForm<User>>["register"] extends (...args: never) => infer R ? R : never }) {
  return (
    <select className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm" {...register}>
      {options.map((option) => <option className="bg-slate-950" key={option} value={option}>{option.toLowerCase().replaceAll("_", " ")}</option>)}
    </select>
  );
}
