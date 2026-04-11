/**
 * useRealtimeCheck.ts
 * Debounced hook that calls POST /check after the user stops typing.
 * Returns compiler errors without requiring a full AI analysis.
 */

import { useState, useEffect, useRef } from 'react';
import { checkCodeRealtime } from '../api/analyze';
import { CompilerError, Language } from '../types';

const DEBOUNCE_MS = 1200;

interface UseRealtimeCheckReturn {
  realtimeErrors: CompilerError[];
  isChecking: boolean;
  compilerMissing: boolean;
}

export const useRealtimeCheck = (
  code: string,
  language: Language,
  enabled: boolean
): UseRealtimeCheckReturn => {
  const [realtimeErrors, setRealtimeErrors] = useState<CompilerError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [compilerMissing, setCompilerMissing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !code.trim()) {
      setRealtimeErrors([]);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsChecking(true);
      try {
        const result = await checkCodeRealtime(code, language);
        setRealtimeErrors(result.compilerErrors);
        setCompilerMissing(result.compilerMissing);
      } catch {
        // silently ignore — don't show errors for background checks
      } finally {
        setIsChecking(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, language, enabled]);

  // Clear on language switch
  useEffect(() => {
    setRealtimeErrors([]);
    setIsChecking(false);
  }, [language]);

  return { realtimeErrors, isChecking, compilerMissing };
};
