// jest.setup.api.js
import { TextEncoder, TextDecoder } from 'util'
import { Request, Response, Headers } from 'undici'

// Polyfill Web APIs for Node environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Use undici's Web API implementations
global.Request = Request
global.Response = Response
global.Headers = Headers

// Polyfill URL and URLSearchParams for older Node versions
if (!global.URL) {
  global.URL = require('url').URL
}

if (!global.URLSearchParams) {
  global.URLSearchParams = require('url').URLSearchParams
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
}) 