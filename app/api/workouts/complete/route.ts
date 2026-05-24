import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ historyId: z.string(), durationSec: z.number().int().min(0) });

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  try {
    const input = schema.parse(await request.json());
    const logs = await prisma.exerciseLog.findMany({ where: { historyId: input.historyId, userId: user.id } });
    const totalVolume = logs.reduce((sum, log) => sum + log.reps * log.weightKg, 0);
    const history = await prisma.workoutHistory.update({
      where: { id: input.historyId },
      data: { completed: true, completedAt: new Date(), durationSec: input.durationSec }
    });
    await prisma.userProgress.create({
      data: { userId: user.id, totalVolume, workoutsDone: 1 }
    });
    return ok({ history });
  } catch (error) {
    return badRequest(error);
  }
}
