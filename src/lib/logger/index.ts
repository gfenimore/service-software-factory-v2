// src/lib/logger/index.ts
import pino from 'pino'
import { getLoggerConfig } from './config'

const config = getLoggerConfig()
export const logger = pino(config as pino.LoggerOptions)

// Convenience methods
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)

// Structured logging helpers
export function logApiRequest(method: string, path: string, metadata?: Record<string, unknown>) {
  logger.info({
    type: 'api_request',
    method,
    path,
    ...metadata,
  }, `API Request: ${method} ${path}`)
}

export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, unknown>
) {
  const level = statusCode >= 400 ? 'warn' : 'info'
  logger[level]({
    type: 'api_response',
    method,
    path,
    statusCode,
    duration,
    ...metadata,
  }, `API Response: ${method} ${path} - ${statusCode} (${duration}ms)`)
}

export function logDatabaseQuery(
  operation: string,
  table: string,
  duration: number,
  metadata?: Record<string, unknown>
) {
  logger.debug({
    type: 'database_query',
    operation,
    table,
    duration,
    ...metadata,
  }, `Database: ${operation} on ${table} (${duration}ms)`)
}

export function logBusinessEvent(
  event: string,
  metadata?: Record<string, unknown>
) {
  logger.info({
    type: 'business_event',
    event,
    ...metadata,
  }, `Business Event: ${event}`)
}