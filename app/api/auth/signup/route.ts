import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) return ok({ message: "Email already registered." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12)
      },
      select: { id: true, email: true, name: true }
    });

    await setAuthCookie(user.id);
    return ok({ user });
  } catch (error) {
    return badRequest(error);
  }
}
