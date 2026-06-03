import { badRequest, ok, profileSchema, unauthorized } from "@/lib/api";
import { createSupabaseServerClient, getCurrentUser, mapProfile } from "@/lib/supabase";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const input = profileSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: input.name,
        weight_kg: input.weightKg ?? null,
        height_cm: input.heightCm ?? null,
        goal: input.goal,
        experience_level: input.experienceLevel,
        workout_preference: input.workoutPreference,
        profile_image_url: input.profileImageUrl || null
      })
      .eq("id", user.id)
      .select("id,email,name,weight_kg,height_cm,goal,experience_level,workout_preference,profile_image_url")
      .single();

    if (error) return ok({ message: error.message }, { status: 400 });
    return ok({ user: mapProfile(data) });
  } catch (error) {
    return badRequest(error);
  }
}
