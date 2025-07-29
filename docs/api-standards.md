# API Route Standards
**Version**: 1.0
**Location**: `/docs/api-standards.md`

## Overview

All API routes in the Service Platform follow these standards for consistency, type safety, and maintainability.

## Response Format

### Success Response
```json
{
  "data": {
    // Response data
  },
  "metadata": {
    "total": 100,      // Total records (for paginated responses)
    "page": 1,         // Current page
    "pageSize": 20     // Page size
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

## HTTP Status Codes

- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

## Pagination

All list endpoints support pagination via query parameters:

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20, max: 100)
- `sortBy` - Field to sort by (default: created_at)
- `sortOrder` - Sort direction: asc/desc (default: desc)

Example: `/api/accounts?page=2&pageSize=10&sortBy=account_name&sortOrder=asc`

## Standard CRUD Pattern

### List Resources
```typescript
// GET /api/[resource]
export const GET = createApiHandler(async (request, { supabase }) => {
  const pagination = getPaginationParams(request)
  
  const { data, error, count } = await buildQuery(
    supabase,
    'resource_table',
    pagination
  )
  
  if (error) throw new DatabaseError(error.message)
  
  return successResponse(data, {
    total: count || 0,
    page: pagination.page,
    pageSize: pagination.pageSize
  })
})
```

### Get Single Resource
```typescript
// GET /api/[resource]/[id]
export const GET = createApiHandler(async (request, { supabase }) => {
  const id = request.nextUrl.pathname.split('/').pop()
  
  const { data, error } = await supabase
    .from('resource_table')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resource not found')
    }
    throw new DatabaseError(error.message)
  }
  
  return successResponse(data)
})
```

### Create Resource
```typescript
// POST /api/[resource]
export const POST = createApiHandler(async (request, { supabase }) => {
  const body = await request.json()
  
  // Validate required fields
  validateRequired(body.name, 'name')
  
  const { data, error } = await supabase
    .from('resource_table')
    .insert(body)
    .select()
    .single()
  
  if (error) throw new DatabaseError(error.message)
  
  return successResponse(data, undefined, 201)
}, { logEvent: 'resource_created' })
```

### Update Resource
```typescript
// PATCH /api/[resource]/[id]
export const PATCH = createApiHandler(async (request, { supabase }) => {
  const id = request.nextUrl.pathname.split('/').pop()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('resource_table')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resource not found')
    }
    throw new DatabaseError(error.message)
  }
  
  return successResponse(data)
}, { logEvent: 'resource_updated' })
```

### Delete Resource
```typescript
// DELETE /api/[resource]/[id]
export const DELETE = createApiHandler(async (request, { supabase }) => {
  const id = request.nextUrl.pathname.split('/').pop()
  
  const { error } = await supabase
    .from('resource_table')
    .delete()
    .eq('id', id)
  
  if (error) throw new DatabaseError(error.message)
  
  return new NextResponse(null, { status: 204 })
}, { logEvent: 'resource_deleted' })
```

## Error Handling

All errors are automatically:
1. Logged with full context
2. Transformed to standard format
3. Returned with appropriate status codes

## Business Event Logging

Configure business events in the handler:

```typescript
createApiHandler(handler, { 
  logEvent: 'account_created',
  requireAuth: true,
  allowedMethods: ['POST']
})
```

## Testing API Routes

```typescript
// Example test
describe('GET /api/accounts', () => {
  it('should return paginated accounts', async () => {
    const request = new NextRequest('http://localhost:3000/api/accounts?page=1&pageSize=10')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.data).toBeArray()
    expect(data.metadata.page).toBe(1)
    expect(data.metadata.pageSize).toBe(10)
  })
})
```

## File Organization

```
src/app/api/
├── accounts/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/
│       └── route.ts      # GET (single), PATCH, DELETE
├── contacts/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── health/
    └── route.ts
```