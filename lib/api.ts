import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  return NextResponse.json({ message: "Invalid request" }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ message: "Authentication required" }, { status: 401 });
}

export const profileSchema = z.object({
  name: z.string().min(2),
  weightKg: z.coerce.number().min(30).max(250).nullable().optional(),
  heightCm: z.coerce.number().min(100).max(240).nullable().optional(),
  goal: z.enum(["BUILD_MUSCLE", "LOSE_FAT", "GET_STRONGER", "IMPROVE_ENDURANCE", "GENERAL_FITNESS"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  workoutPreference: z.enum(["GYM", "HOME", "HYBRID"]),
  profileImageUrl: z.string().url().nullable().optional().or(z.literal(""))
});
