export interface Exercise {
  id: number;
  name: string;
  workoutDivisionId: number;
}

export interface ExercisesResponse {
  results: Exercise[];
}

export interface ExerciseResponse {
  results: Exercise;
}
