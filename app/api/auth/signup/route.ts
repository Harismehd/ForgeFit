import { z } from "zod";
import { badRequest, ok } from "@/lib/api";
import { createSupabaseServerClient, mapProfile } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name } }
    });

    if (error) return ok({ message: error.message }, { status: 400 });
    if (!data.user) return ok({ message: "Signup could not be completed." }, { status: 400 });

    if (!data.session) {
      return ok({
        requiresEmailConfirmation: true,
        message: "Account created. Confirm your email before logging in, or turn off email confirmation for local testing."
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        email: data.user.email ?? input.email,
        name: input.name
      })
      .select("id,email,name,weight_kg,height_cm,goal,experience_level,workout_preference,profile_image_url")
      .single();

    if (profileError) {
      return ok(
        {
          message: `Auth user was created, but profile setup failed: ${profileError.message}. Run supabase.sql again and confirm RLS policies exist.`
        },
        { status: 400 }
      );
    }

    return ok({ user: mapProfile(profile) });
  } catch (error) {
    return badRequest(error);
  }
}
