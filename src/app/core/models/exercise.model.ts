export interface ExerciseDTO {
  workoutDivisionId: number;
  name: string;
}

export interface ExerciseUpdateDTO {
  newExerciseName: string;
}

export interface ExerciseResponseDTO {
  exerciseId: number;
  exerciseName: string;
  workoutDivisionId: number;
}
