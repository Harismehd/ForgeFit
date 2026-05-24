import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  historyId: z.string(),
  exerciseId: z.string(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).max(100),
  weightKg: z.number().min(0).max(600),
  completed: z.boolean()
});

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  try {
    const input = schema.parse(await request.json());
    const history = await prisma.workoutHistory.findFirst({ where: { id: input.historyId, userId: user.id } });
    if (!history) return unauthorized();

    const log = await prisma.exerciseLog.upsert({
      where: {
        historyId_exerciseId_setNumber: {
          historyId: input.historyId,
          exerciseId: input.exerciseId,
          setNumber: input.setNumber
        }
      },
      create: { ...input, userId: user.id },
      update: { reps: input.reps, weightKg: input.weightKg, completed: input.completed }
    });
    return ok({ log });
  } catch (error) {
    return badRequest(error);
  }
}
