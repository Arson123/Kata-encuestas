export interface ScaleAgg {
  avg: number;
  n: number;
  min: number;
  max: number;
}

export interface SingleAgg {
  optionId: string;
  label: string;
  count: number;
  percent: number;
}

export interface SummaryResponse {
  responsesTotal: number;
  lastResponseAt: string;
  perQuestion: Record<string, ScaleAgg | SingleAgg[]>;
}

export interface TimePoint {
  t: string;
  responses: number;
}
