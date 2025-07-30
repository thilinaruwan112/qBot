export type BetSuggestion = {
  position: number;
  yield: number;
  probability: number;
  risk: 'Low' | 'Medium' | 'High';
};

export type GameEvent = {
  id: string;
  crashPoint: number;
  timestamp?: string;
  name?: string;
};
