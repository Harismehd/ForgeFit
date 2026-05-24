import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ workoutId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();
  try {
    const { workoutId } = schema.parse(await request.json());
    const history = await prisma.workoutHistory.create({
      data: { userId: user.id, workoutId },
      include: { logs: true, workout: true }
    });
    return ok({ history });
  } catch (error) {
    return badRequest(error);
  }
}
