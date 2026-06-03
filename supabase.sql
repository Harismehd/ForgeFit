create extension if not exists pgcrypto;

create type fitness_goal as enum (
  'BUILD_MUSCLE',
  'LOSE_FAT',
  'GET_STRONGER',
  'IMPROVE_ENDURANCE',
  'GENERAL_FITNESS'
);

create type experience_level as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
create type workout_preference as enum ('GYM', 'HOME', 'HYBRID');
create type difficulty as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default 'ForgeFit Member',
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  goal fitness_goal not null default 'GENERAL_FITNESS',
  experience_level experience_level not null default 'BEGINNER',
  workout_preference workout_preference not null default 'GYM',
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  level difficulty not null,
  days_per_week integer not null check (days_per_week between 1 and 7),
  created_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  name text not null,
  day_index integer not null,
  focus text[] not null,
  duration_min integer not null check (duration_min > 0)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  muscle_group text not null,
  difficulty difficulty not null,
  equipment text not null,
  instructions text not null,
  youtube_url text not null check (youtube_url like 'https://www.youtube.com/watch?v=%'),
  calories_per_set integer not null default 7
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  order_index integer not null,
  target_sets integer not null check (target_sets > 0),
  target_reps text not null,
  rest_seconds integer not null check (rest_seconds >= 0),
  unique (workout_id, exercise_id)
);

create table public.workout_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_sec integer not null default 0,
  completed boolean not null default false
);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  history_id uuid not null references public.workout_history(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  reps integer not null check (reps >= 0 and reps <= 100),
  weight_kg numeric(6,2) not null default 0 check (weight_kg >= 0 and weight_kg <= 600),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (history_id, exercise_id, set_number)
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null default now(),
  body_weight_kg numeric(5,2),
  total_volume numeric(10,2) not null default 0,
  workouts_done integer not null default 0
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'ForgeFit Member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.exercises (name, slug, muscle_group, difficulty, equipment, instructions, youtube_url, calories_per_set)
values
  ('Barbell Bench Press', 'barbell-bench-press', 'CHEST', 'INTERMEDIATE', 'Barbell, bench', 'Keep shoulder blades pinned, lower the bar to mid-chest, drive through your feet, and press until elbows lock without losing control.', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 9),
  ('Back Squat', 'back-squat', 'LEGS', 'INTERMEDIATE', 'Barbell, squat rack', 'Brace hard, sit between your hips, keep knees tracking over toes, reach depth under control, then drive up through the whole foot.', 'https://www.youtube.com/watch?v=Dy28eq2PjcM', 12),
  ('Conventional Deadlift', 'conventional-deadlift', 'BACK', 'ADVANCED', 'Barbell', 'Set the bar over mid-foot, wedge hips close, brace, push the floor away, and keep the bar tight against your legs.', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 13),
  ('Pull-Up', 'pull-up', 'BACK', 'INTERMEDIATE', 'Pull-up bar', 'Start from a dead hang, pull elbows toward ribs, clear your chin over the bar, and lower under control.', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 8),
  ('Seated Dumbbell Shoulder Press', 'seated-dumbbell-shoulder-press', 'SHOULDERS', 'INTERMEDIATE', 'Dumbbells, bench', 'Brace ribs down, press dumbbells slightly inward overhead, and lower until elbows are just below shoulders.', 'https://www.youtube.com/watch?v=qEwKCR5JCog', 8),
  ('Dumbbell Bicep Curl', 'dumbbell-bicep-curl', 'BICEPS', 'BEGINNER', 'Dumbbells', 'Keep elbows near your sides, curl without swinging, squeeze at the top, and lower slowly.', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', 5),
  ('Cable Tricep Pushdown', 'cable-tricep-pushdown', 'TRICEPS', 'BEGINNER', 'Cable machine, rope or bar', 'Pin elbows by your sides, extend fully, separate the rope slightly at the bottom, and resist the cable upward.', 'https://www.youtube.com/watch?v=2-LAMcpzODU', 5),
  ('Romanian Deadlift', 'romanian-deadlift', 'GLUTES', 'INTERMEDIATE', 'Barbell or dumbbells', 'Soften knees, hinge hips back, keep weights close, feel hamstrings load, and stand tall without overextending.', 'https://www.youtube.com/watch?v=JCXUYuzwNrM', 10),
  ('Walking Lunge', 'walking-lunge', 'LEGS', 'BEGINNER', 'Bodyweight or dumbbells', 'Step long enough to keep front heel grounded, lower the back knee, drive through the front foot, and alternate smoothly.', 'https://www.youtube.com/watch?v=L8fvypPrzzs', 9),
  ('Plank', 'plank', 'CORE', 'BEGINNER', 'Bodyweight', 'Stack elbows under shoulders, squeeze glutes, pull ribs down, and hold a straight line from head to heels.', 'https://www.youtube.com/watch?v=pSHjTRCQxIw', 4),
  ('Lat Pulldown', 'lat-pulldown', 'BACK', 'BEGINNER', 'Cable pulldown machine', 'Lean back slightly, pull elbows down toward ribs, touch upper chest, and control the stretch overhead.', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', 7),
  ('Incline Dumbbell Press', 'incline-dumbbell-press', 'CHEST', 'INTERMEDIATE', 'Dumbbells, incline bench', 'Set bench around 30 degrees, lower dumbbells beside upper chest, and press up while keeping wrists stacked.', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 8)
on conflict (slug) do nothing;

insert into public.workout_plans (name, slug, description, level, days_per_week)
values
  ('Push Pull Legs', 'push-pull-legs', 'A balanced hypertrophy plan for gym members who want reliable progression without personal coaching.', 'INTERMEDIATE', 6),
  ('Full Body Foundation', 'full-body-foundation', 'Three efficient full-body sessions each week for consistency, strength, and visible progress.', 'BEGINNER', 3),
  ('Upper Lower', 'upper-lower', 'Four-day split for members who want repeatable strength practice and enough recovery.', 'INTERMEDIATE', 4)
on conflict (slug) do nothing;

with plan_rows as (
  select id, slug from public.workout_plans
),
inserted_workouts as (
  insert into public.workouts (plan_id, name, day_index, focus, duration_min)
  values
    ((select id from plan_rows where slug = 'push-pull-legs'), 'Push Strength', 1, array['CHEST','SHOULDERS','TRICEPS'], 58),
    ((select id from plan_rows where slug = 'push-pull-legs'), 'Pull Strength', 2, array['BACK','BICEPS'], 55),
    ((select id from plan_rows where slug = 'push-pull-legs'), 'Legs Performance', 3, array['LEGS','GLUTES','CORE'], 62),
    ((select id from plan_rows where slug = 'full-body-foundation'), 'Full Body A', 1, array['FULL_BODY'], 48),
    ((select id from plan_rows where slug = 'full-body-foundation'), 'Full Body B', 2, array['FULL_BODY'], 50),
    ((select id from plan_rows where slug = 'upper-lower'), 'Upper Power', 1, array['CHEST','BACK','SHOULDERS'], 60),
    ((select id from plan_rows where slug = 'upper-lower'), 'Lower Power', 2, array['LEGS','GLUTES'], 60)
  returning id, name
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds)
select w.id, e.id, item.order_index, item.target_sets, item.target_reps, item.rest_seconds
from inserted_workouts w
join (
  values
    ('Push Strength', 'barbell-bench-press', 1, 4, '5-8', 120),
    ('Push Strength', 'seated-dumbbell-shoulder-press', 2, 3, '8-10', 90),
    ('Push Strength', 'incline-dumbbell-press', 3, 3, '8-12', 90),
    ('Push Strength', 'cable-tricep-pushdown', 4, 3, '10-14', 60),
    ('Pull Strength', 'conventional-deadlift', 1, 3, '3-5', 150),
    ('Pull Strength', 'pull-up', 2, 4, '6-10', 90),
    ('Pull Strength', 'lat-pulldown', 3, 3, '10-12', 75),
    ('Pull Strength', 'dumbbell-bicep-curl', 4, 3, '10-12', 60),
    ('Legs Performance', 'back-squat', 1, 4, '5-8', 150),
    ('Legs Performance', 'romanian-deadlift', 2, 3, '8-10', 120),
    ('Legs Performance', 'walking-lunge', 3, 3, '10 each', 75),
    ('Legs Performance', 'plank', 4, 3, '45-60 sec', 45),
    ('Full Body A', 'back-squat', 1, 3, '8-10', 120),
    ('Full Body A', 'barbell-bench-press', 2, 3, '8-10', 90),
    ('Full Body A', 'lat-pulldown', 3, 3, '10-12', 75),
    ('Full Body A', 'plank', 4, 3, '40 sec', 45),
    ('Full Body B', 'romanian-deadlift', 1, 3, '8-10', 120),
    ('Full Body B', 'seated-dumbbell-shoulder-press', 2, 3, '8-10', 90),
    ('Full Body B', 'walking-lunge', 3, 3, '10 each', 75),
    ('Full Body B', 'dumbbell-bicep-curl', 4, 2, '12-14', 60),
    ('Upper Power', 'barbell-bench-press', 1, 4, '4-6', 150),
    ('Upper Power', 'pull-up', 2, 4, '6-8', 90),
    ('Upper Power', 'seated-dumbbell-shoulder-press', 3, 3, '6-8', 90),
    ('Upper Power', 'cable-tricep-pushdown', 4, 3, '10-12', 60),
    ('Lower Power', 'back-squat', 1, 4, '4-6', 150),
    ('Lower Power', 'conventional-deadlift', 2, 3, '3-5', 150),
    ('Lower Power', 'walking-lunge', 3, 3, '10 each', 75),
    ('Lower Power', 'plank', 4, 3, '60 sec', 45)
) as item(workout_name, exercise_slug, order_index, target_sets, target_reps, rest_seconds)
  on item.workout_name = w.name
join public.exercises e on e.slug = item.exercise_slug
on conflict (workout_id, exercise_id) do nothing;

alter table public.profiles enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_history enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.user_progress enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "catalog_read_plans" on public.workout_plans for select to authenticated using (true);
create policy "catalog_read_workouts" on public.workouts for select to authenticated using (true);
create policy "catalog_read_exercises" on public.exercises for select to authenticated using (true);
create policy "catalog_read_workout_exercises" on public.workout_exercises for select to authenticated using (true);

create policy "history_select_own" on public.workout_history for select to authenticated using (auth.uid() = user_id);
create policy "history_insert_own" on public.workout_history for insert to authenticated with check (auth.uid() = user_id);
create policy "history_update_own" on public.workout_history for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "history_delete_own" on public.workout_history for delete to authenticated using (auth.uid() = user_id);

create policy "logs_select_own" on public.exercise_logs for select to authenticated using (auth.uid() = user_id);
create policy "logs_insert_own" on public.exercise_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "logs_update_own" on public.exercise_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "logs_delete_own" on public.exercise_logs for delete to authenticated using (auth.uid() = user_id);

create policy "progress_select_own" on public.user_progress for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.user_progress for delete to authenticated using (auth.uid() = user_id);
