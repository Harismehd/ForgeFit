import { clearAuthCookie, getUserFromRequest } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();
  return ok({ user });
}

export async function DELETE() {
  await clearAuthCookie();
  return ok({ ok: true });
}
