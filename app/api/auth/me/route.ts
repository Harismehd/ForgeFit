import { ok, unauthorized } from "@/lib/api";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return ok({ user });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return ok({ ok: true });
}
