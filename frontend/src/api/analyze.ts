import api from './client';
import { AnalysisResult, RealtimeCheckResult, RunResult, Language, Difficulty } from '../types';

export const analyzeCode = (code: string, language: Language, difficulty: Difficulty) =>
  api.post<AnalysisResult>('/analyze', { code, language, difficulty }).then((r) => r.data);

export const checkCodeRealtime = (code: string, language: Language) =>
  api.post<RealtimeCheckResult>('/check', { code, language }).then((r) => r.data);

export const runCode = (code: string, language: Language, stdin = '') =>
  api.post<RunResult>('/run', { code, language, stdin }).then((r) => r.data);
