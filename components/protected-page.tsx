import { redirect } from "next/navigation";
import { getUserFromRequest } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export async function ProtectedPage({ children }: { children: React.ReactNode }) {
  const user = await getUserFromRequest();
  if (!user) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
