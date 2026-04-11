export type Language = 'c' | 'cpp' | 'python';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export interface CompilerError {
  line: number | null;
  column: number | null;
  type: 'error' | 'warning' | 'ai-detected';
  errorName: string;          // human-readable name e.g. "Missing Semicolon"
  raw: string;                // raw compiler message
  explanation: string;
  hint: string;
  whyItHappens: string;
}

export interface AnalysisResult {
  compilerErrors: CompilerError[];
  hasCompilerErrors: boolean;
  compilerOutput: string;
  compilerMissing: boolean;
  explanation: string;
  hints: string[];
  difficulty: Difficulty;
  aiUnavailable?: boolean;
}

export interface RealtimeCheckResult {
  compilerErrors: CompilerError[];
  hasCompilerErrors: boolean;
  compilerMissing: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Progress {
  analysesCount: number;
  languagesUsed: Language[];
  practiceCompleted: string[];
  streak: number;
  lastActive: string | null;
  totalErrorsFound: number;
  level: Difficulty;
}

export interface PracticeQuestion {
  id: string;
  difficulty: Difficulty;
  language: Language;
  title: string;
  description: string;
  errorType: string;
  brokenCode: string;
  hints: string[];
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  compileError: boolean;
  compilerMissing: boolean;
}

export interface SampleProgram {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  code: string;
}
