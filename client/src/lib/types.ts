export interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  section: 'mcq' | 'coding';
}

export interface MCQQuestionState {
  currentQuestion: number;
  answers: Record<number, string>;
  flagged: Set<number>;
  visited: Set<number>;
}

export interface CodingState {
  language: string;
  code: string;
  isRunning: boolean;
  testResults: any[];
}

export interface StudentSession {
  id: number;
  name: string;
  email: string;
  currentSection: string;
  mcqStartTime?: Date;
  codingStartTime?: Date;
}
