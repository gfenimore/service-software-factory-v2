// src/lib/errors/error-handler.ts
import { NextRequest } from 'next/server'
import { AppError } from './custom-errors'
import { logger } from '@/lib/logger'

export async function handleApiError(
  error: unknown,
  request?: NextRequest
): Promise<{ error: AppError; statusCode: number }> {
  // Log the error with context
  const errorContext = {
    url: request?.url,
    method: request?.method,
    headers: request ? Object.fromEntries(request.headers.entries()) : undefined,
  }

  if (error instanceof AppError) {
    logger.warn({
      type: 'app_error',
      error,
      ...errorContext,
    }, `Application Error: ${error.message}`)
    
    return {
      error,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    logger.error({
      type: 'unexpected_error',
      error,
      ...errorContext,
    }, `Unexpected Error: ${error.message}`)
    
    return {
      error: new AppError(
        'An unexpected error occurred',
        500
      ),
      statusCode: 500,
    }
  }

  logger.error({
    type: 'unknown_error',
    error: String(error),
    ...errorContext,
  }, 'Unknown error type')

  return {
    error: new AppError(
      'An unknown error occurred',
      500
    ),
    statusCode: 500,
  }
}