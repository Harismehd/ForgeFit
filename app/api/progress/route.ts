import { ok, unauthorized } from "@/lib/api";
import { mapHistory, mapProgress } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = await createSupabaseServerClient();
  const [historyResult, progressResult] = await Promise.all([
    supabase
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
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(60),
    supabase
      .from("user_progress")
      .select("id,user_id,date,body_weight_kg,total_volume,workouts_done")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(60)
  ]);

  if (historyResult.error) return ok({ message: historyResult.error.message }, { status: 400 });
  if (progressResult.error) return ok({ message: progressResult.error.message }, { status: 400 });

  const history = historyResult.data.map(mapHistory);
  const progress = progressResult.data.map(mapProgress);
  const totalWorkouts = history.length;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const weeklyWorkouts = history.filter((item) => item.completedAt && new Date(String(item.completedAt)) >= weekStart).length;
  const streak = calculateStreak(history.map((item) => item.completedAt).filter(Boolean).map((date) => new Date(String(date))));
  const calories =
    history[0]?.logs.reduce((sum, log) => sum + Number(log.exercise?.caloriesPerSet ?? 0), 0) ?? 0;

  return ok({
    metrics: { totalWorkouts, weeklyWorkouts, streak, calories },
    progress,
    recent: history.slice(0, 6)
  });
}

function calculateStreak(dates: Date[]) {
  const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 90; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) streak += 1;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
