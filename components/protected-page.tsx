import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

export async function ProtectedPage({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
