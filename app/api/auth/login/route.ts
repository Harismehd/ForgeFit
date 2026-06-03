import { z } from "zod";
import { badRequest, ok } from "@/lib/api";
import { createSupabaseServerClient, mapProfile } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);

    if (error || !data.user) {
      return ok({ message: error?.message ?? "Invalid email or password." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,name,weight_kg,height_cm,goal,experience_level,workout_preference,profile_image_url")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return ok(
        {
          message: `Login worked, but your profile row is missing or blocked by RLS: ${profileError?.message ?? "profile not found"}. Run supabase.sql and sign up again.`
        },
        { status: 400 }
      );
    }

    return ok({ user: mapProfile(profile) });
  } catch (error) {
    return badRequest(error);
  }
}
