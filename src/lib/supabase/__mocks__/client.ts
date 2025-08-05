// src/lib/supabase/__mocks__/client.ts
export function createClient() {
    return {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ 
            data: [], 
            error: null 
          }))
        }))
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ 
          data: { user: null }, 
          error: null 
        })),
        signIn: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
        signOut: jest.fn(() => Promise.resolve({ 
          error: null 
        }))
      }
    }
  }