import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder BEFORE importing undici
import { TextEncoder, TextDecoder } from 'util'
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

import { URL, URLSearchParams } from 'url'
import { Request, Response, Headers, FormData } from 'undici'
import './src/test/mocks/supabase.ts'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Polyfill Web APIs for Node environment
globalThis.Request = Request
globalThis.Response = Response
globalThis.Headers = Headers
globalThis.FormData = FormData

// Add URL polyfills if needed
if (!global.URL) global.URL = URL
if (!global.URLSearchParams) global.URLSearchParams = URLSearchParams

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})