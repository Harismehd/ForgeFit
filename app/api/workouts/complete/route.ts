import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { mapHistory } from "@/lib/db-mappers";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

const schema = z.object({ historyId: z.string().uuid(), durationSec: z.number().int().min(0) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const input = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data: logs, error: logsError } = await supabase
      .from("exercise_logs")
      .select("reps,weight_kg")
      .eq("history_id", input.historyId)
      .eq("user_id", user.id);

    if (logsError) return ok({ message: logsError.message }, { status: 400 });

    const totalVolume = logs.reduce((sum, log) => sum + Number(log.reps) * Number(log.weight_kg), 0);
    const { data, error } = await supabase
      .from("workout_history")
      .update({ completed: true, completed_at: new Date().toISOString(), duration_sec: input.durationSec })
      .eq("id", input.historyId)
      .eq("user_id", user.id)
      .select("id,workout_id,started_at,completed_at,duration_sec,completed,workouts(id,name,day_index,focus,duration_min),exercise_logs(id,exercise_id,set_number,reps,weight_kg,completed,created_at)")
      .single();

    if (error) return ok({ message: error.message }, { status: 400 });

    await supabase.from("user_progress").insert({
      user_id: user.id,
      total_volume: totalVolume,
      workouts_done: 1
    });

    return ok({ history: mapHistory(data) });
  } catch (error) {
    return badRequest(error);
  }
}
