import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return ok({ message: "Invalid email or password." }, { status: 401 });
    }

    await setAuthCookie(user.id);
    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weightKg: user.weightKg,
        heightCm: user.heightCm,
        goal: user.goal,
        experienceLevel: user.experienceLevel,
        workoutPreference: user.workoutPreference,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    return badRequest(error);
  }
}
