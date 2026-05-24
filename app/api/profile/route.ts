import { getUserFromRequest } from "@/lib/auth";
import { badRequest, ok, profileSchema, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const user = await getUserFromRequest();
  if (!user) return unauthorized();

  try {
    const input = profileSchema.parse(await request.json());
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...input,
        profileImageUrl: input.profileImageUrl || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        weightKg: true,
        heightCm: true,
        goal: true,
        experienceLevel: true,
        workoutPreference: true,
        profileImageUrl: true
      }
    });
    return ok({ user: updated });
  } catch (error) {
    return badRequest(error);
  }
}
