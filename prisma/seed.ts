import { PrismaClient, Difficulty, MuscleGroup } from "@prisma/client";
import bcrypt from "bcryptjs";
import { exercises } from "./seed-data/exercises";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Push Pull Legs",
    slug: "push-pull-legs",
    description: "A balanced hypertrophy plan for gym members who want reliable progression without personal coaching.",
    level: Difficulty.INTERMEDIATE,
    daysPerWeek: 6,
    workouts: [
      { name: "Push Strength", dayIndex: 1, focus: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS], durationMin: 58, items: [["barbell-bench-press", 4, "5-8", 120], ["seated-dumbbell-shoulder-press", 3, "8-10", 90], ["incline-dumbbell-press", 3, "8-12", 90], ["cable-tricep-pushdown", 3, "10-14", 60]] },
      { name: "Pull Strength", dayIndex: 2, focus: [MuscleGroup.BACK, MuscleGroup.BICEPS], durationMin: 55, items: [["conventional-deadlift", 3, "3-5", 150], ["pull-up", 4, "6-10", 90], ["lat-pulldown", 3, "10-12", 75], ["dumbbell-bicep-curl", 3, "10-12", 60]] },
      { name: "Legs Performance", dayIndex: 3, focus: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE], durationMin: 62, items: [["back-squat", 4, "5-8", 150], ["romanian-deadlift", 3, "8-10", 120], ["walking-lunge", 3, "10 each", 75], ["plank", 3, "45-60 sec", 45]] }
    ]
  },
  {
    name: "Full Body Foundation",
    slug: "full-body-foundation",
    description: "Three efficient full-body sessions each week for consistency, strength, and visible progress.",
    level: Difficulty.BEGINNER,
    daysPerWeek: 3,
    workouts: [
      { name: "Full Body A", dayIndex: 1, focus: [MuscleGroup.FULL_BODY], durationMin: 48, items: [["back-squat", 3, "8-10", 120], ["barbell-bench-press", 3, "8-10", 90], ["lat-pulldown", 3, "10-12", 75], ["plank", 3, "40 sec", 45]] },
      { name: "Full Body B", dayIndex: 2, focus: [MuscleGroup.FULL_BODY], durationMin: 50, items: [["romanian-deadlift", 3, "8-10", 120], ["seated-dumbbell-shoulder-press", 3, "8-10", 90], ["walking-lunge", 3, "10 each", 75], ["dumbbell-bicep-curl", 2, "12-14", 60]] }
    ]
  },
  {
    name: "Upper Lower",
    slug: "upper-lower",
    description: "Four-day split for members who want repeatable strength practice and enough recovery.",
    level: Difficulty.INTERMEDIATE,
    daysPerWeek: 4,
    workouts: [
      { name: "Upper Power", dayIndex: 1, focus: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS], durationMin: 60, items: [["barbell-bench-press", 4, "4-6", 150], ["pull-up", 4, "6-8", 90], ["seated-dumbbell-shoulder-press", 3, "6-8", 90], ["cable-tricep-pushdown", 3, "10-12", 60]] },
      { name: "Lower Power", dayIndex: 2, focus: [MuscleGroup.LEGS, MuscleGroup.GLUTES], durationMin: 60, items: [["back-squat", 4, "4-6", 150], ["conventional-deadlift", 3, "3-5", 150], ["walking-lunge", 3, "10 each", 75], ["plank", 3, "60 sec", 45]] }
    ]
  }
];

async function main() {
  await prisma.exerciseLog.deleteMany();
  await prisma.workoutHistory.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  for (const exercise of exercises) {
    await prisma.exercise.create({ data: exercise });
  }

  for (const plan of plans) {
    const created = await prisma.workoutPlan.create({
      data: {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        level: plan.level,
        daysPerWeek: plan.daysPerWeek
      }
    });

    for (const workout of plan.workouts) {
      const createdWorkout = await prisma.workout.create({
        data: {
          planId: created.id,
          name: workout.name,
          dayIndex: workout.dayIndex,
          focus: workout.focus,
          durationMin: workout.durationMin
        }
      });

      for (const [index, item] of workout.items.entries()) {
        const exercise = await prisma.exercise.findUniqueOrThrow({ where: { slug: item[0] as string } });
        await prisma.workoutExercise.create({
          data: {
            workoutId: createdWorkout.id,
            exerciseId: exercise.id,
            order: index + 1,
            targetSets: item[1] as number,
            targetReps: item[2] as string,
            restSeconds: item[3] as number
          }
        });
      }
    }
  }

  const demo = await prisma.user.create({
    data: {
      email: "demo@forgefit.app",
      passwordHash: await bcrypt.hash("ForgeFit123!", 12),
      name: "Alex Morgan",
      weightKg: 82,
      heightCm: 178,
      goal: "BUILD_MUSCLE",
      experienceLevel: "INTERMEDIATE",
      workoutPreference: "GYM",
      profileImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop"
    }
  });

  const workouts = await prisma.workout.findMany({ include: { exercises: true }, take: 5 });
  for (let i = 0; i < workouts.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i + 1) * 2);
    await prisma.workoutHistory.create({
      data: {
        userId: demo.id,
        workoutId: workouts[i].id,
        startedAt: date,
        completedAt: new Date(date.getTime() + workouts[i].durationMin * 60 * 1000),
        durationSec: workouts[i].durationMin * 60,
        completed: true
      }
    });
    await prisma.userProgress.create({
      data: {
        userId: demo.id,
        date,
        bodyWeightKg: 82 - i * 0.2,
        totalVolume: 5200 + i * 470,
        workoutsDone: 1
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
