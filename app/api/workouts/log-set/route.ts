import { z } from "zod";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";

const schema = z.object({
  historyId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).max(100),
  weightKg: z.number().min(0).max(600),
  completed: z.boolean()
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const input = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data: history } = await supabase
      .from("workout_history")
      .select("id")
      .eq("id", input.historyId)
      .eq("user_id", user.id)
      .single();

    if (!history) return unauthorized();

    const { data, error } = await supabase
      .from("exercise_logs")
      .upsert(
        {
          user_id: user.id,
          history_id: input.historyId,
          exercise_id: input.exerciseId,
          set_number: input.setNumber,
          reps: input.reps,
          weight_kg: input.weightKg,
          completed: input.completed
        },
        { onConflict: "history_id,exercise_id,set_number" }
      )
      .select("id,exercise_id,set_number,reps,weight_kg,completed,created_at")
      .single();

    if (error) return ok({ message: error.message }, { status: 400 });
    return ok({
      log: {
        id: data.id,
        exerciseId: data.exercise_id,
        setNumber: data.set_number,
        reps: data.reps,
        weightKg: data.weight_kg,
        completed: data.completed,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    return badRequest(error);
  }
}
