import api from './client';
import { PracticeQuestion, SampleProgram, Language, Difficulty } from '../types';

export const getPracticeQuestions = (params?: { difficulty?: Difficulty; language?: Language }) =>
  api
    .get<{ questions: PracticeQuestion[]; total: number }>('/practice', { params })
    .then((r) => r.data);

export const getSamples = (language: Language) =>
  api.get<{ samples: SampleProgram[] }>(`/samples/${language}`).then((r) => r.data.samples);
