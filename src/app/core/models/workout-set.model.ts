export interface WorkoutSet {
  id: number;
  name: string;
  reps: number;
  weight: number;
  exerciseId: number;
}

// Backend response shape: the name field is called setName here, name on POST, and
// newName on PATCH — three different keys for the same concept (see Hurdle H6 in
// api-contracts.md). The service maps WorkoutSetDto -> WorkoutSet instead of leaking
// these names into the app.
export interface WorkoutSetDto {
  exerciseSetId: number;
  setName: string;
  reps: number;
  weight: number;
  exerciseId: number;
}

// PATCH /sets/:id is a partial update: only the fields present here are overwritten
// server-side, so this type is intentionally not derived from WorkoutSet.
export interface WorkoutSetUpdate {
  newName?: string;
  reps?: number;
  weight?: number;
}

export interface WorkoutSetsResponse {
  results: WorkoutSetDto[];
}

export interface WorkoutSetResponse {
  results: WorkoutSetDto;
}
