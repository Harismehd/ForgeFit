"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/client-api";

type FormValues = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { email: "demo@forgefit.app", password: "ForgeFit123!" }
  });

  async function onSubmit(values: FormValues) {
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(values) });
      toast.success("Welcome back. Your workout is ready.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Dumbbell className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">ForgeFit</h1>
            <p className="text-sm text-muted-foreground">Train with structure, not guesswork.</p>
          </div>
        </div>
        <Card className="p-6">
          <h2 className="text-xl font-bold">Log in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the seeded demo account or your own profile.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" autoComplete="email" {...register("email", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" autoComplete="current-password" {...register("password", { required: true })} />
            </div>
            <Button disabled={formState.isSubmitting} className="w-full" size="lg">
              {formState.isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New here? <Link className="font-semibold text-primary" href="/signup">Create account</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
