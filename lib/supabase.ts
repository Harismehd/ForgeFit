import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  weightKg: number | null;
  heightCm: number | null;
  goal: string;
  experienceLevel: string;
  workoutPreference: string;
  profileImageUrl: string | null;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies; route handlers can.
          }
        }
      }
    }
  );
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,name,weight_kg,height_cm,goal,experience_level,workout_preference,profile_image_url")
    .eq("id", data.user.id)
    .single();

  return profile
    ? mapProfile(profile)
    : {
        id: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.name ?? "ForgeFit Member",
        weightKg: null,
        heightCm: null,
        goal: "GENERAL_FITNESS",
        experienceLevel: "BEGINNER",
        workoutPreference: "GYM",
        profileImageUrl: null
      };
}

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    weightKg: row.weight_kg as number | null,
    heightCm: row.height_cm as number | null,
    goal: row.goal as string,
    experienceLevel: row.experience_level as string,
    workoutPreference: row.workout_preference as string,
    profileImageUrl: row.profile_image_url as string | null
  };
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
