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

type FormValues = { name: string; email: string; password: string };

export default function SignupPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    try {
      await api("/api/auth/signup", { method: "POST", body: JSON.stringify(values) });
      toast.success("Account created. Let's tune your profile next.");
      router.push("/profile");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Dumbbell className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-black tracking-tight">ForgeFit</h1>
        </div>
        <Card className="p-6">
          <h2 className="text-xl font-bold">Create your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name", { required: true, minLength: 2 })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...register("password", { required: true, minLength: 8 })} />
            </div>
            <Button disabled={formState.isSubmitting} className="w-full" size="lg">
              {formState.isSubmitting ? "Creating..." : "Start training"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already training? <Link className="font-semibold text-primary" href="/login">Log in</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
