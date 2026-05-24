import { ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  const [history, progress] = await Promise.all([
    prisma.workoutHistory.findMany({
      where: { userId: user.id, completed: true },
      orderBy: { completedAt: "desc" },
      take: 60,
      include: { workout: true, logs: { include: { exercise: true } } }
    }),
    prisma.userProgress.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 60 })
  ]);

  const totalWorkouts = history.length;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const weeklyWorkouts = history.filter((item) => item.completedAt && item.completedAt >= weekStart).length;
  const streak = calculateStreak(history.map((item) => item.completedAt).filter(Boolean) as Date[]);
  const calories = history[0]?.logs.reduce((sum, log) => sum + log.exercise.caloriesPerSet, 0) ?? 0;

  return ok({
    metrics: { totalWorkouts, weeklyWorkouts, streak, calories },
    progress,
    recent: history.slice(0, 6)
  });
}

function calculateStreak(dates: Date[]) {
  const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 90; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) streak += 1;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
