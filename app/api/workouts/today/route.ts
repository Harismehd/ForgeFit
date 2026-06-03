import { ok, unauthorized } from "@/lib/api";
import { mapHistory, mapWorkout } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = await createSupabaseServerClient();
  const { data: plans, error } = await supabase
    .from("workout_plans")
    .select(`
      id,name,
      workouts(
        id,name,day_index,focus,duration_min,
        workout_exercises(
          id,order_index,target_sets,target_reps,rest_seconds,
          exercises(id,name,slug,muscle_group,difficulty,equipment,instructions,youtube_url,calories_per_set)
        )
      )
    `);

  if (error) return ok({ message: error.message }, { status: 400 });

  const allWorkouts = plans.flatMap((plan) =>
    [...plan.workouts]
      .sort((a, b) => a.day_index - b.day_index)
      .map((workout) =>
        mapWorkout(
          { ...workout, workout_exercises: [...workout.workout_exercises].sort((a, b) => a.order_index - b.order_index) },
          plan.name
        )
      )
  );
  const workout = allWorkouts[new Date().getDay() % allWorkouts.length] ?? allWorkouts[0];

  const { data: activeHistory } = await supabase
    .from("workout_history")
    .select("id,workout_id,started_at,completed_at,duration_sec,completed,exercise_logs(id,exercise_id,set_number,reps,weight_kg,completed,created_at)")
    .eq("user_id", user.id)
    .eq("workout_id", workout.id)
    .eq("completed", false)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ok({ workout, activeHistory: activeHistory ? mapHistory(activeHistory) : null });
}
