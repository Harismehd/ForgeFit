import { Difficulty, MuscleGroup } from "@prisma/client";

export const exercises = [
  {
    name: "Barbell Bench Press",
    slug: "barbell-bench-press",
    muscleGroup: MuscleGroup.CHEST,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Barbell, bench",
    instructions: "Keep shoulder blades pinned, lower the bar to mid-chest, drive through your feet, and press until elbows lock without losing control.",
    youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    caloriesPerSet: 9
  },
  {
    name: "Back Squat",
    slug: "back-squat",
    muscleGroup: MuscleGroup.LEGS,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Barbell, squat rack",
    instructions: "Brace hard, sit between your hips, keep knees tracking over toes, reach depth under control, then drive up through the whole foot.",
    youtubeUrl: "https://www.youtube.com/watch?v=Dy28eq2PjcM",
    caloriesPerSet: 12
  },
  {
    name: "Conventional Deadlift",
    slug: "conventional-deadlift",
    muscleGroup: MuscleGroup.BACK,
    difficulty: Difficulty.ADVANCED,
    equipment: "Barbell",
    instructions: "Set the bar over mid-foot, wedge hips close, brace, push the floor away, and keep the bar tight against your legs.",
    youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
    caloriesPerSet: 13
  },
  {
    name: "Pull-Up",
    slug: "pull-up",
    muscleGroup: MuscleGroup.BACK,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Pull-up bar",
    instructions: "Start from a dead hang, pull elbows toward ribs, clear your chin over the bar, and lower under control.",
    youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    caloriesPerSet: 8
  },
  {
    name: "Seated Dumbbell Shoulder Press",
    slug: "seated-dumbbell-shoulder-press",
    muscleGroup: MuscleGroup.SHOULDERS,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Dumbbells, bench",
    instructions: "Brace ribs down, press dumbbells slightly inward overhead, and lower until elbows are just below shoulders.",
    youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    caloriesPerSet: 8
  },
  {
    name: "Dumbbell Bicep Curl",
    slug: "dumbbell-bicep-curl",
    muscleGroup: MuscleGroup.BICEPS,
    difficulty: Difficulty.BEGINNER,
    equipment: "Dumbbells",
    instructions: "Keep elbows near your sides, curl without swinging, squeeze at the top, and lower slowly.",
    youtubeUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    caloriesPerSet: 5
  },
  {
    name: "Cable Tricep Pushdown",
    slug: "cable-tricep-pushdown",
    muscleGroup: MuscleGroup.TRICEPS,
    difficulty: Difficulty.BEGINNER,
    equipment: "Cable machine, rope or bar",
    instructions: "Pin elbows by your sides, extend fully, separate the rope slightly at the bottom, and resist the cable upward.",
    youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
    caloriesPerSet: 5
  },
  {
    name: "Romanian Deadlift",
    slug: "romanian-deadlift",
    muscleGroup: MuscleGroup.GLUTES,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Barbell or dumbbells",
    instructions: "Soften knees, hinge hips back, keep weights close, feel hamstrings load, and stand tall without overextending.",
    youtubeUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
    caloriesPerSet: 10
  },
  {
    name: "Walking Lunge",
    slug: "walking-lunge",
    muscleGroup: MuscleGroup.LEGS,
    difficulty: Difficulty.BEGINNER,
    equipment: "Bodyweight or dumbbells",
    instructions: "Step long enough to keep front heel grounded, lower the back knee, drive through the front foot, and alternate smoothly.",
    youtubeUrl: "https://www.youtube.com/watch?v=L8fvypPrzzs",
    caloriesPerSet: 9
  },
  {
    name: "Plank",
    slug: "plank",
    muscleGroup: MuscleGroup.CORE,
    difficulty: Difficulty.BEGINNER,
    equipment: "Bodyweight",
    instructions: "Stack elbows under shoulders, squeeze glutes, pull ribs down, and hold a straight line from head to heels.",
    youtubeUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    caloriesPerSet: 4
  },
  {
    name: "Lat Pulldown",
    slug: "lat-pulldown",
    muscleGroup: MuscleGroup.BACK,
    difficulty: Difficulty.BEGINNER,
    equipment: "Cable pulldown machine",
    instructions: "Lean back slightly, pull elbows down toward ribs, touch upper chest, and control the stretch overhead.",
    youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    caloriesPerSet: 7
  },
  {
    name: "Incline Dumbbell Press",
    slug: "incline-dumbbell-press",
    muscleGroup: MuscleGroup.CHEST,
    difficulty: Difficulty.INTERMEDIATE,
    equipment: "Dumbbells, incline bench",
    instructions: "Set bench around 30 degrees, lower dumbbells beside upper chest, and press up while keeping wrists stacked.",
    youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    caloriesPerSet: 8
  }
];
