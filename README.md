# ForgeFit

ForgeFit is a production-oriented fitness web app for gym members who train without a personal trainer. It includes JWT authentication, protected routes, Prisma/PostgreSQL persistence, structured workout plans, real YouTube exercise demos, set logging, workout history, progress metrics, charts, search/filter, and a mobile-first dark SaaS interface.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS with shadcn-style primitives
- Framer Motion
- Zustand
- TanStack Query
- Prisma ORM
- PostgreSQL
- JWT auth with httpOnly cookies

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set `DATABASE_URL` to a PostgreSQL database. Local Postgres, Supabase, Neon, and Railway all work. If you have Docker installed, you can start the included local database:

```bash
docker compose up -d
```

4. Generate Prisma client and create tables:

```bash
npm run db:push
```

5. Seed workout plans, real exercise demos, and a demo member:

```bash
npm run prisma:seed
```

6. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Login

- Email: `demo@forgefit.app`
- Password: `ForgeFit123!`

## How To Test It

1. Log in with the demo account.
2. Visit Dashboard and confirm today&apos;s workout, weekly progress, streak, calories, and chart load from API data.
3. Open Plans and confirm structured workout plans render with exercises.
4. Start Today&apos;s Workout, enter reps and weights, mark sets complete, and verify the rest timer starts.
5. Finish the workout after all sets are complete.
6. Visit History and confirm the completed workout appears with duration and volume.
7. Visit Exercises, search for `press`, filter by muscle group/difficulty, and open demo links.
8. Edit Profile and confirm the saved values persist after refresh.

Useful checks:

```bash
npm run typecheck
npm run build
```

## Architecture

- `app/api/*`: typed Next.js route handlers for auth, profile, workout plans, logging, history, exercises, and progress.
- `app/*/ui.tsx`: client views using TanStack Query for caching and mutations.
- `components/ui`: reusable shadcn-style UI primitives.
- `components/app-shell.tsx`: protected app navigation and responsive mobile tab bar.
- `lib/auth.ts`: JWT creation, verification, and secure cookie management.
- `lib/prisma.ts`: Prisma singleton.
- `prisma/schema.prisma`: relational database design for users, plans, workouts, exercises, logs, progress, and history.
- `prisma/seed.ts`: realistic seed data and a demo user.

## Deployment Notes

### Vercel

Set these environment variables in Vercel:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

Build command:

```bash
npm run build
```

Before first production use, run Prisma migration or `prisma db push` against the production database, then seed if desired.

### Railway/Supabase/Postgres

Create a PostgreSQL database and copy its connection string into `DATABASE_URL`. Keep `JWT_SECRET` private and at least 32 characters long.
