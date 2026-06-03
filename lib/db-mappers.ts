export function mapExercise(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    muscleGroup: row.muscle_group,
    difficulty: row.difficulty,
    equipment: row.equipment,
    instructions: row.instructions,
    youtubeUrl: row.youtube_url,
    caloriesPerSet: row.calories_per_set
  };
}

export function mapWorkoutExercise(row: Record<string, unknown>) {
  const exercise = row.exercises as Record<string, unknown>;
  return {
    id: row.id,
    targetSets: row.target_sets,
    targetReps: row.target_reps,
    restSeconds: row.rest_seconds,
    order: row.order_index,
    exercise: mapExercise(exercise)
  };
}

export function mapWorkout(row: Record<string, unknown>, planName?: string) {
  const workoutExercises = (row.workout_exercises ?? []) as Record<string, unknown>[];
  return {
    id: row.id,
    name: row.name,
    dayIndex: row.day_index,
    focus: row.focus,
    durationMin: row.duration_min,
    ...(planName ? { planName } : {}),
    exercises: workoutExercises.map(mapWorkoutExercise)
  };
}

export function mapHistory(row: Record<string, unknown>) {
  const logs = (row.exercise_logs ?? []) as Record<string, unknown>[];
  const workout = row.workouts as Record<string, unknown>;
  return {
    id: row.id,
    workoutId: row.workout_id,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSec: row.duration_sec,
    completed: row.completed,
    workout: workout ? mapWorkout(workout) : null,
    logs: logs.map((log) => ({
      id: log.id,
      exerciseId: log.exercise_id,
      setNumber: log.set_number,
      reps: log.reps,
      weightKg: log.weight_kg,
      completed: log.completed,
      createdAt: log.created_at,
      exercise: log.exercises ? mapExercise(log.exercises as Record<string, unknown>) : null
    }))
  };
}

export function mapProgress(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    bodyWeightKg: row.body_weight_kg,
    totalVolume: row.total_volume,
    workoutsDone: row.workouts_done
  };
}
