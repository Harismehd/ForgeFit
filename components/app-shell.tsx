"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Dumbbell, History, Library, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/workouts", label: "Plans", icon: Dumbbell },
  { href: "/exercises", label: "Library", icon: Library },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await api("/api/auth/me", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-black/25 px-5 py-6 backdrop-blur-xl md:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight">ForgeFit</span>
            <span className="text-xs text-muted-foreground">Self-guided training</span>
          </span>
        </Link>
        <nav className="mt-9 space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition",
                  active ? "bg-white/10 text-foreground shadow-panel" : "hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button onClick={logout} variant="outline" className="absolute bottom-6 left-5 right-5">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-5 md:ml-72 md:px-8 md:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-black/80 px-2 py-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-lg py-2 text-[11px]", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
