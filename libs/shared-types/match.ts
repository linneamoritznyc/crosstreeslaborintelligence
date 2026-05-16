export interface ConfidenceInterval {
  low: number;
  high: number;
  method: string;
}

export interface MatchResult {
  score: number;
  missing_required: string[];
  missing_preferred: string[];
  matched_required: string[];
  confidence_interval: ConfidenceInterval;
}
