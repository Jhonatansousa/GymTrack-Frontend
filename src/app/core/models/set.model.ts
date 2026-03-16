export interface ExerciseSetDTO {
  exerciseId: number;
  name?: string;
  reps: number;
  weight: number;
}

export interface ExerciseSetUpdateDTO {
  newName?: string;
  reps?: number;
  weight?: number;
}

export interface ExerciseSetResponseDTO {
  exerciseId: number;
  exerciseSetId: number;
  setName: string;
  reps: number;
  weight: number;
}
