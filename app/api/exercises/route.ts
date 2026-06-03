import { NextRequest } from "next/server";
import { ok, unauthorized } from "@/lib/api";
import { mapExercise } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const search = request.nextUrl.searchParams.get("q") ?? "";
  const muscleGroup = request.nextUrl.searchParams.get("muscleGroup") ?? "";
  const difficulty = request.nextUrl.searchParams.get("difficulty") ?? "";
  const equipment = request.nextUrl.searchParams.get("equipment") ?? "";
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("exercises")
    .select("id,name,slug,muscle_group,difficulty,equipment,instructions,youtube_url,calories_per_set")
    .order("muscle_group")
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);
  if (muscleGroup) query = query.eq("muscle_group", muscleGroup);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (equipment) query = query.ilike("equipment", `%${equipment}%`);

  const { data, error } = await query;
  if (error) return ok({ message: error.message }, { status: 400 });
  return ok({ exercises: data.map(mapExercise) });
}
