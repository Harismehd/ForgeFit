# ForgeFit

ForgeFit is a premium self-guided gym training app built with Next.js 15, Supabase Auth, Supabase Postgres, Row Level Security, Tailwind CSS, Framer Motion, Zustand, and TanStack Query.

The app no longer uses Prisma, a local PostgreSQL connection string, custom JWT handling, or password hashing in application code. Authentication and database access now run through Supabase.

## Local Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not add service-role keys to this app. The anon key is safe for browser/server use only because database access is protected by RLS.

## Supabase Setup

1. Go to [Supabase](https://supabase.com), create a new project, and choose a strong database password.
2. Open `Project Settings > API`.
3. Copy `Project URL` into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the `anon public` key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Open `Authentication > Providers > Email`.
6. For easiest local testing, turn off email confirmation. For production, turn it on and configure SMTP.
7. Open `SQL Editor`.
8. Paste and run the full SQL from `supabase.sql`.

The SQL creates:

- `profiles`
- `workout_plans`
- `workouts`
- `exercises`
- `workout_exercises`
- `workout_history`
- `exercise_logs`
- `user_progress`
- Supabase Auth profile trigger
- RLS policies for catalog reads and user-owned private data
- Real workout plan and exercise seed data

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a new account from the signup page, then log workouts normally.

## Verify Migration

1. In Supabase `Table Editor`, confirm `workout_plans`, `workouts`, `exercises`, and `workout_exercises` contain seeded rows.
2. Sign up in ForgeFit.
3. Confirm Supabase `Authentication > Users` shows the new user.
4. Confirm `profiles` has a row with the same user id.
5. Start today&apos;s workout, complete at least one set, then finish the workout.
6. Confirm rows appear in `workout_history`, `exercise_logs`, and `user_progress`.
7. Log out and log back in.
8. Confirm Dashboard, History, Exercises, and Profile still load.

RLS sanity check: create two different app users and complete a workout with only one of them. Each user should only see their own profile, history, logs, and progress in the app. The shared exercise and plan catalog should appear for both users.

## Security Notes

- `.env` and `.env.local` are ignored by Git.
- Never commit Supabase service-role keys.
- Never place secret keys in frontend code.
- Supabase Auth stores passwords securely; the app does not handle password hashes.
- User-owned tables use `auth.uid()` RLS policies.
- Public workout catalog tables are read-only for authenticated users.

## Deployment To Vercel

1. Push the repo to GitHub.
2. In Vercel, import the GitHub repository.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
```

7. Deploy.

After deployment, open Supabase `Authentication > URL Configuration` and set:

- Site URL: your Vercel URL
- Redirect URLs: your Vercel URL and local URL if you still test locally

## Git Commands

```bash
git status
git add .
git commit -m "Migrate ForgeFit to Supabase with RLS"
git push -u origin main
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Architecture

- `app/api/*`: Next.js route handlers using Supabase Auth session cookies and RLS-backed queries.
- `lib/supabase.ts`: Supabase SSR client and current-user profile helper.
- `lib/db-mappers.ts`: Converts Supabase snake_case rows into the camelCase shape the UI expects.
- `supabase.sql`: Full database schema, seed catalog, triggers, and RLS policies.
- `components/app-shell.tsx`: Protected navigation and responsive app shell.
- `app/*/ui.tsx`: Client screens using TanStack Query for caching and mutations.
