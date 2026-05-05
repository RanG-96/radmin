import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '../lib/error';

export function useFormError(initialValue: string | null = null) {
  const [error, setError] = useState<string | null>(initialValue);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((value: unknown, fallback: string) => {
    setError(getApiErrorMessage(value, fallback));
  }, []);

  return {
    error,
    setError,
    clearError,
    captureError,
  };
}
