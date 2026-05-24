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
          exercises: { orderBy: { order: "asc" }, include: { exercise: true } }
        }
      }
    }
  });

  const allWorkouts = plans.flatMap((plan) => plan.workouts.map((workout) => ({ ...workout, planName: plan.name })));
  const todayIndex = new Date().getDay() % allWorkouts.length;
  const workout = allWorkouts[todayIndex] ?? allWorkouts[0];
  const activeHistory = await prisma.workoutHistory.findFirst({
    where: { userId: user.id, workoutId: workout.id, completed: false },
    include: { logs: true },
    orderBy: { startedAt: "desc" }
  });

  return ok({ workout, activeHistory });
}
