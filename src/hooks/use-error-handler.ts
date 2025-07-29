'use client';

import { useCallback } from 'react';
import { AppError } from '@/lib/errors/custom-errors';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    console.error('Client error:', error);

    if (error instanceof AppError && error.statusCode === 401) {
      // Handle authentication errors
      window.location.href = '/login';
      return;
    }

    // You can add toast notifications here
    // For now, just log
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    console.error('Error to user:', message);
  }, []);

  return { handleError };
}