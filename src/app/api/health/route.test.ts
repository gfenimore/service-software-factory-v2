import { GET } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
  })
})
