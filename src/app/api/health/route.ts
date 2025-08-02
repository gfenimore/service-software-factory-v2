import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { error } = await supabase
      .from('accounts')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        api: 'operational'
      }
    }
    
    logger.info('Health check passed', response)
    
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Health check failed', { error })
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}