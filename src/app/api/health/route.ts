import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { handleApiError } from '@/lib/errors/error-handler'
import { withRequestLogging } from '@/lib/logger/middleware'
import { logDatabaseQuery, logBusinessEvent } from '@/lib/logger'

export const GET = withRequestLogging(async (request: NextRequest) => {
  try {
    const supabase = createClient()
    
    // Test database connection with logging
    const start = Date.now()
    const { error } = await supabase.from('accounts').select('count').limit(1)
    const duration = Date.now() - start
    
    logDatabaseQuery('SELECT', 'accounts', duration, { 
      purpose: 'health_check' 
    })
    
    if (error) throw error
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        api: 'operational',
      },
    }
    
    logBusinessEvent('health_check_success', response)
    
    return NextResponse.json(response)
  } catch (error) {
    const { error: appError, statusCode } = await handleApiError(error, request)
    
    logBusinessEvent('health_check_failure', {
      error: appError.message,
      code: appError.code,
    })
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: appError.message,
      },
      { status: statusCode }
    )
  }
})