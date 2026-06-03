import { ok, unauthorized } from "@/lib/api";
import { mapWorkout } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(`
      id,name,slug,description,level,days_per_week,
      workouts(
        id,name,day_index,focus,duration_min,
        workout_exercises(
          id,order_index,target_sets,target_reps,rest_seconds,
          exercises(id,name,slug,muscle_group,difficulty,equipment,instructions,youtube_url,calories_per_set)
        )
      )
    `)
    .order("days_per_week", { ascending: false });

  if (error) return ok({ message: error.message }, { status: 400 });

  const plans = data.map((plan) => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    level: plan.level,
    daysPerWeek: plan.days_per_week,
    workouts: [...plan.workouts]
      .sort((a, b) => a.day_index - b.day_index)
      .map((workout) => mapWorkout({ ...workout, workout_exercises: [...workout.workout_exercises].sort((a, b) => a.order_index - b.order_index) }))
  }));

  return ok({ plans });
}
