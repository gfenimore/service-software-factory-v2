// src/app/api/health/route.test.ts
import { GET } from '@/app/api/health/route'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')
// Cast createClient to a Jest mock
const createClientMock = createClient as jest.Mock
// Default mock for healthy scenario
createClientMock.mockReturnValue({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
})

describe('Health Check API', () => {
  it('should return healthy status when database is connected', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database).toBe('connected')
  })

  it('should return unhealthy status when database connection fails', async () => {
    // Mock database error
    createClientMock.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ 
            data: null, 
            error: new Error('Database connection failed') 
          })),
        })),
      })),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})