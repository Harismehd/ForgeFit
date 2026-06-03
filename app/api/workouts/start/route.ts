import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { mapHistory } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

const schema = z.object({ workoutId: z.string().uuid() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { workoutId } = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("workout_history")
      .insert({ user_id: user.id, workout_id: workoutId })
      .select("id,workout_id,started_at,completed_at,duration_sec,completed,workouts(id,name,day_index,focus,duration_min),exercise_logs(id,exercise_id,set_number,reps,weight_kg,completed,created_at)")
      .single();

    if (error) return ok({ message: error.message }, { status: 400 });
    return ok({ history: mapHistory(data) });
  } catch (error) {
    return badRequest(error);
  }
}
