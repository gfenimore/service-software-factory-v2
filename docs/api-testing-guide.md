# API Route Testing Guide for Next.js 14

## Overview
This guide explains how to properly test Next.js 14 API routes with Jest, using proper Request/Response polyfills without workarounds.

## Setup Summary

### 1. **Separate Jest Configurations**
- `jest.config.mjs` - For React component tests (uses jsdom environment)
- `jest.config.api.mjs` - For API route tests (uses node environment)

### 2. **Key Dependencies**
- `jest` - Test runner
- `undici` - Provides Web API polyfills (Request, Response, Headers)
- `@testing-library/jest-dom` - DOM assertions
- Standard Next.js dependencies

### 3. **Setup Files**
- `jest.setup.js` - Component test setup
- `jest.setup.api.js` - API test setup with Request/Response polyfills

## Running Tests

```bash
# Run all component tests
npm test

# Run all API tests
npm run test:api

# Run specific API test file
npm run test:api -- --no-watch src/app/api/health/route.test.ts

# Run all tests in CI mode
npm run test:ci

# Generate coverage reports
npm run test:coverage         # Components
npm run test:api:coverage     # API routes
```

## Writing API Route Tests

### Basic GET Request Test
```typescript
import { GET } from '@/app/api/health/route';

it('should return healthy status', async () => {
  const response = await GET();
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.status).toBe('healthy');
});
```

### GET Request with Query Parameters
```typescript
import { GET } from '@/app/api/example/route';
import { NextRequest } from 'next/server';

it('should handle query parameters', async () => {
  const request = new NextRequest(
    new Request('http://localhost:3000/api/example?name=John&role=admin')
  );
  
  const response = await GET(request);
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.message).toBe('Hello, John!');
});
```

### POST Request with Body
```typescript
import { POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

it('should create user', async () => {
  const request = new NextRequest(
    new Request('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
      }),
    })
  );
  
  const response = await POST(request);
  const data = await response.json();
  
  expect(response.status).toBe(201);
  expect(data.name).toBe('John Doe');
});
```

### Testing Error Scenarios
```typescript
it('should handle database errors', async () => {
  // Mock your database client to throw an error
  createClientMock.mockReturnValueOnce({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: new Error('Connection failed') 
        })),
      })),
    })),
  });

  const response = await GET();
  const data = await response.json();
  
  expect(response.status).toBe(500);
  expect(data.error).toBeDefined();
});
```

## Key Points

1. **No Hacks Required**: Using `undici` provides proper Web API implementations
2. **Separate Environments**: API tests run in Node environment, component tests in jsdom
3. **Type Safety**: Full TypeScript support with proper types
4. **Real Request/Response**: Tests use actual Request/Response objects, not mocks

## Common Issues and Solutions

### Issue: "Request is not defined"
**Solution**: Ensure you're using the API test config: `npm run test:api`

### Issue: Tests interfering with each other
**Solution**: API tests are isolated from component tests via separate configs

### Issue: Environment variables not loading
**Solution**: Check `jest.setup.api.js` for environment variable mocks

## Best Practices

1. **Test actual route handlers** - Import and call the route functions directly
2. **Use NextRequest** - Wrap standard Request objects with NextRequest for full compatibility
3. **Clean up mocks** - Always clear mocks between tests (handled by setup file)
4. **Test edge cases** - Include tests for validation, errors, and edge cases

## Example Test Structure
```
src/
├── app/
│   └── api/
│       ├── health/
│       │   ├── route.ts
│       │   └── route.test.ts
│       └── users/
│           ├── route.ts
│           └── route.test.ts
```

This setup provides a clean, hack-free way to test Next.js 14 API routes with full type safety and proper Web API support. 