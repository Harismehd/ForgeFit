import { ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  const history = await prisma.workoutHistory.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 30,
    include: {
      workout: true,
      logs: { include: { exercise: true }, orderBy: { createdAt: "asc" } }
    }
  });

  return ok({ history });
}
