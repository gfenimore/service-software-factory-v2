import { createClient } from '../server'
import { processorSessionQueries } from '../queries/processor-sessions'
import type { Database } from '../types'

type ProcessorSessionInsert = Database['public']['Tables']['processor_sessions']['Insert']

/**
 * API functions for processor sessions
 * These are higher-level functions that can be used in API routes and server components
 */

/**
 * Create a new processor session with the specified details
 */
export async function createProcessorSessionRecord(sessionData: {
  userStory: string
  taskId: string
  currentProcessor: string
  sessionType: 'manual' | 'automated'
  processorsTotal: number
  createdBy: string
}): Promise<string> {
  const supabase = await createClient()
  
  const insertData: ProcessorSessionInsert = {
    user_story: sessionData.userStory,
    task_id: sessionData.taskId,
    current_processor: sessionData.currentProcessor,
    session_type: sessionData.sessionType,
    status: 'started',
    processors_completed: 0,
    processors_total: sessionData.processorsTotal,
    created_by: sessionData.createdBy,
    started_at: new Date().toISOString(),
  }

  const session = await processorSessionQueries.createProcessorSession(supabase, insertData)
  return session.id
}

/**
 * Quick function to create a processor session for US-001, T-001
 */
export async function createUS001ProcessorSession(): Promise<string> {
  return createProcessorSessionRecord({
    userStory: 'US-001',
    taskId: 'T-001',
    currentProcessor: 'TYPE-PROCESSOR',
    sessionType: 'manual',
    processorsTotal: 8,
    createdBy: 'system'
  })
}