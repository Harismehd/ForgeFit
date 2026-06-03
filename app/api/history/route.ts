import { ok, unauthorized } from "@/lib/api";
import { mapHistory } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workout_history")
    .select(`
      id,workout_id,started_at,completed_at,duration_sec,completed,
      workouts(id,name,day_index,focus,duration_min),
      exercise_logs(
        id,exercise_id,set_number,reps,weight_kg,completed,created_at,
        exercises(id,name,slug,muscle_group,difficulty,equipment,instructions,youtube_url,calories_per_set)
      )
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(30);

  if (error) return ok({ message: error.message }, { status: 400 });
  return ok({ history: data.map(mapHistory) });
}
