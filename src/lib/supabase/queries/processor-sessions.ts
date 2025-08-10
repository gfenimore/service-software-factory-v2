import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type Client = SupabaseClient<Database>
type ProcessorSession = Database['public']['Tables']['processor_sessions']['Row']
type ProcessorSessionInsert = Database['public']['Tables']['processor_sessions']['Insert']
type ProcessorSessionUpdate = Database['public']['Tables']['processor_sessions']['Update']

/**
 * Processor Session-related queries for Supabase
 * These functions encapsulate database operations and provide type safety
 */

export const processorSessionQueries = {
  /**
   * Create a new processor session
   */
  createProcessorSession: async (
    supabase: Client,
    session: ProcessorSessionInsert
  ): Promise<ProcessorSession> => {
    const { data, error } = await supabase
      .from('processor_sessions')
      .insert({
        ...session,
        processors_completed: session.processors_completed || 0,
        status: session.status || 'started',
        started_at: session.started_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create processor session: ${error.message}`)
    }

    return data
  },

  /**
   * Get processor session by ID
   */
  getProcessorSessionById: async (supabase: Client, id: string): Promise<ProcessorSession | null> => {
    const { data, error } = await supabase
      .from('processor_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new Error(`Failed to fetch processor session: ${error.message}`)
    }

    return data
  },

  /**
   * Update processor session status
   */
  updateProcessorSession: async (
    supabase: Client,
    id: string,
    updates: ProcessorSessionUpdate
  ): Promise<ProcessorSession> => {
    const { data, error } = await supabase
      .from('processor_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update processor session: ${error.message}`)
    }

    return data
  },

  /**
   * Get all processor sessions
   */
  getAllProcessorSessions: async (supabase: Client): Promise<ProcessorSession[]> => {
    const { data, error } = await supabase
      .from('processor_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch processor sessions: ${error.message}`)
    }

    return data || []
  },

  /**
   * Get processor sessions by status
   */
  getProcessorSessionsByStatus: async (
    supabase: Client,
    status: 'started' | 'in_progress' | 'completed' | 'failed'
  ): Promise<ProcessorSession[]> => {
    const { data, error } = await supabase
      .from('processor_sessions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch processor sessions by status: ${error.message}`)
    }

    return data || []
  }
}