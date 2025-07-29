// src/lib/logger/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { logger, logApiRequest, logApiResponse } from './index'

type RouteHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse> | NextResponse

export function withRequestLogging(
  handler: RouteHandler,
  options?: { skipPaths?: string[] }
): RouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    const start = Date.now()
    const path = request.nextUrl.pathname
    const method = request.method

    // Skip logging for certain paths
    if (options?.skipPaths?.includes(path)) {
      return handler(request, context)
    }

    // Log request
    logApiRequest(method, path, {
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    })

    try {
      const response = await handler(request, context)
      const duration = Date.now() - start

      // Log response
      logApiResponse(method, path, response.status, duration)

      return response
    } catch (error) {
      const duration = Date.now() - start
      
      // Log error
      logger.error({
        type: 'api_error',
        method,
        path,
        duration,
        error,
      }, `API Error: ${method} ${path}`)

      throw error
    }
  }
}