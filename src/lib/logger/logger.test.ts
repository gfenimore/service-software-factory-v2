import { logger, logApiRequest, logBusinessEvent, logDatabaseQuery, logApiResponse } from './index'

// Mock pino for testing
jest.mock('pino', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
  return jest.fn(() => mockLogger)
})

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('logApiRequest', () => {
    it('should log API requests with correct structure', () => {
      logApiRequest('GET', '/api/users', { userId: '123' })
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_request',
          method: 'GET',
          path: '/api/users',
          userId: '123',
        }),
        'API Request: GET /api/users'
      )
    })

    it('should log API requests without metadata', () => {
      logApiRequest('POST', '/api/accounts')
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_request',
          method: 'POST',
          path: '/api/accounts',
        }),
        'API Request: POST /api/accounts'
      )
    })
  })

  describe('logApiResponse', () => {
    it('should log successful responses at info level', () => {
      logApiResponse('GET', '/api/users', 200, 125, { count: 10 })
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_response',
          method: 'GET',
          path: '/api/users',
          statusCode: 200,
          duration: 125,
          count: 10,
        }),
        'API Response: GET /api/users - 200 (125ms)'
      )
    })

    it('should log error responses at warn level', () => {
      logApiResponse('POST', '/api/accounts', 400, 50)
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api_response',
          method: 'POST',
          path: '/api/accounts',
          statusCode: 400,
          duration: 50,
        }),
        'API Response: POST /api/accounts - 400 (50ms)'
      )
    })
  })

  describe('logDatabaseQuery', () => {
    it('should log database queries at debug level', () => {
      logDatabaseQuery('SELECT', 'accounts', 25, { limit: 10 })
      
      expect(logger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'database_query',
          operation: 'SELECT',
          table: 'accounts',
          duration: 25,
          limit: 10,
        }),
        'Database: SELECT on accounts (25ms)'
      )
    })
  })

  describe('logBusinessEvent', () => {
    it('should log business events with metadata', () => {
      logBusinessEvent('user_registered', { userId: '123', email: 'test@example.com' })
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'business_event',
          event: 'user_registered',
          userId: '123',
          email: 'test@example.com',
        }),
        'Business Event: user_registered'
      )
    })

    it('should log business events without metadata', () => {
      logBusinessEvent('system_startup')
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'business_event',
          event: 'system_startup',
        }),
        'Business Event: system_startup'
      )
    })
  })
})