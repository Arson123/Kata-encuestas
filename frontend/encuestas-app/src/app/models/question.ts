export type QuestionType = 'SCALE' | 'SINGLE';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  required?: boolean;
  order?: number;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'SCALE';
  scaleMin: number;
  scaleMax: number;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'SINGLE';
  options?: Option[];
}

export type Question = ScaleQuestion | SingleQuestion;

export interface Option {
  id: string;
  questionId?: string;
  order?: number;
  label: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}
