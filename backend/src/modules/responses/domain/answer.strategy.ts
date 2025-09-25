// Answer strategy
export interface AnswerStrategy {
  answer(questionId: string, answer: any): boolean;
}