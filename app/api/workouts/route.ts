import { ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  const plans = await prisma.workoutPlan.findMany({
    include: {
      workouts: {
        orderBy: { dayIndex: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true }
          }
        }
      }
    },
    orderBy: { daysPerWeek: "desc" }
  });
  return ok({ plans });
}
