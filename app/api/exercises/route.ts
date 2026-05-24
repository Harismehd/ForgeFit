import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return ok({ exercises: [] }, { status: 401 });

  const search = request.nextUrl.searchParams.get("q") ?? "";
  const muscleGroup = request.nextUrl.searchParams.get("muscleGroup") ?? undefined;
  const difficulty = request.nextUrl.searchParams.get("difficulty") ?? undefined;
  const equipment = request.nextUrl.searchParams.get("equipment") ?? "";

  const exercises = await prisma.exercise.findMany({
    where: {
      name: { contains: search, mode: "insensitive" },
      ...(muscleGroup ? { muscleGroup: muscleGroup as never } : {}),
      ...(difficulty ? { difficulty: difficulty as never } : {}),
      ...(equipment ? { equipment: { contains: equipment, mode: "insensitive" } } : {})
    },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }]
  });

  return ok({ exercises });
}
