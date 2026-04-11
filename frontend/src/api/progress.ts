import api from './client';
import { Progress, Language } from '../types';

export const getProgress = () =>
  api.get<{ progress: Progress }>('/progress').then((r) => r.data.progress);

export const updateProgress = (payload: {
  language?: Language;
  errorsFound?: number;
  practiceId?: string;
  analysisCompleted?: boolean;
}) => api.post<{ progress: Progress }>('/progress/update', payload).then((r) => r.data.progress);
