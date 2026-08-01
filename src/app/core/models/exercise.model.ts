export interface Exercise {
  id: number;
  name: string;
  workoutDivisionId: number;
}

// Backend response shape: the exercise's own key/name fields don't follow the
// id/name convention used elsewhere in the API (e.g. divisions), so the service
// maps ExerciseDto -> Exercise instead of leaking these names into the app.
export interface ExerciseDto {
  exerciseId: number;
  exerciseName: string;
  workoutDivisionId: number;
}

export interface ExercisesResponse {
  results: ExerciseDto[];
}

export interface ExerciseResponse {
  results: ExerciseDto;
}
