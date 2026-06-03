# ForgeFit

ForgeFit is a premium, self-guided gym training application designed for users who want a structured, intuitive, and highly responsive workout experience. 

Built with modern web technologies, ForgeFit offers a seamless interface for discovering workout plans, tracking progress, and logging exercise sets in real-time.

## ✨ Key Features

- **Personalized Dashboard**: Get a quick overview of your weekly consistency, training volume, and current streaks.
- **Workout Tracking**: Log your sets, reps, and weights during a workout with an intuitive, distraction-free interface.
- **Extensive Exercise Library**: Browse a rich catalog of exercises complete with instructions, muscle group targets, and video demonstrations.
- **Progress Analytics**: Visualize your fitness journey through detailed charts showing volume over time and workout completion metrics.
- **Responsive Design**: A beautiful, dark-mode-first aesthetic built with Tailwind CSS, ensuring a premium feel on both desktop and mobile devices.

## 🛠️ Technology Stack

ForgeFit leverages a cutting-edge, highly performant tech stack:

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) for server-rendered React and robust API routes.
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) for rapid, utility-first styling, paired with [Framer Motion](https://www.framer.com/motion/) for fluid animations.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight global state (like rest timers) and [TanStack Query (React Query)](https://tanstack.com/query/latest) for powerful data fetching and caching.
- **Components**: Accessible, unstyled components from [Radix UI](https://www.radix-ui.com/), styled beautifully with [shadcn/ui](https://ui.shadcn.com/) patterns.
- **Backend & Database**: [Supabase](https://supabase.com/) provides a fully managed PostgreSQL database, complete with built-in Authentication and Row Level Security (RLS) to ensure mathematical data isolation between users.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project (Database schema initialized)

### Environment Setup

Create a `.env.local` file in the root of the project and add your public Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## 📐 Architecture Overview

- **`app/`**: Contains the Next.js App Router structure, including pages, layouts, and backend API route handlers (`app/api/*`).
- **`components/`**: Reusable UI components, including the primary `AppShell` and highly interactive client components.
- **`lib/`**: Core utilities, including the Supabase SSR client setup, API helper functions, and database mappers that transform `snake_case` database rows into frontend-friendly `camelCase` objects.
- **`store/`**: Zustand state management stores (e.g., global rest timers).

## 🔒 Security

ForgeFit prioritizes user data privacy. All user-specific tables in the database are protected by Row Level Security (RLS) policies. This ensures that a user can only ever read, update, or delete their own profiles and workout logs. The global exercise and workout plan catalog is securely configured as read-only for authenticated users.
