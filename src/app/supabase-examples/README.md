# Next.js 15 + Supabase Data Fetching Examples

This directory contains comprehensive examples of data fetching patterns using Next.js 15 App Router with Supabase.

## 📁 Examples Overview

### `/supabase-examples/` - Main Examples Page
Demonstrates various data fetching strategies:
- **Static Data Fetching**: Cached until manually invalidated (`force-cache`)
- **Dynamic Data Fetching**: Refetched on every request (`force-dynamic`)
- **Revalidated Data**: Cached for 60 seconds with ISR (`revalidate = 60`)

### `/supabase-examples/dynamic/` - Dynamic Route Example
Shows advanced patterns:
- Dynamic rendering with no caching (`dynamic = 'force-dynamic'`)
- Parallel data loading with multiple Suspense boundaries
- Error handling and not-found scenarios
- Related data fetching

### `/supabase-examples/client-side/` - Client-Side Fetching
Demonstrates client-side data fetching:
- React hooks with `useState` and `useEffect`
- Interactive filters and real-time updates
- Client-side error handling and loading states
- Comparison with server-side approaches

### `/supabase-examples/advanced/` - Advanced Query Patterns
Shows production-ready patterns:
- Reusable query utilities
- Type-safe database operations
- Comprehensive error boundaries
- Performance optimization techniques

## 🛠️ Technical Implementation

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(/* ... */)
}
```

### Query Utilities (`src/lib/supabase/queries/accounts.ts`)
Centralized query functions with:
- Type safety with generated Supabase types
- Error handling and validation
- Reusable patterns for CRUD operations
- Pagination and filtering support

## 🎯 Key Features Demonstrated

### Data Fetching Strategies
1. **Static Generation**: Perfect for content that rarely changes
2. **Server-Side Rendering**: Fresh data on every request
3. **Incremental Static Regeneration**: Balanced approach with timed revalidation
4. **Client-Side Fetching**: Interactive and real-time updates

### Performance Optimizations
- Server Components for reduced client-side JavaScript
- Parallel data fetching with Suspense
- Strategic caching and revalidation
- Progressive loading with skeleton states

### Developer Experience
- Full TypeScript support
- Centralized error handling
- Reusable query utilities
- Clear separation of concerns

## 🚀 Next.js 15 Features Used

- **App Router**: File-based routing with layouts
- **Server Components**: Server-side rendering by default
- **Suspense Streaming**: Progressive page loading
- **Dynamic Segments**: Parameterized routes
- **Route Handlers**: API endpoints (not shown in these examples)

## 📚 Best Practices

1. **Use Server Components by default** for better performance
2. **Implement proper error boundaries** for graceful failures
3. **Centralize query logic** in reusable utilities
4. **Choose the right caching strategy** based on data requirements
5. **Use TypeScript** for type safety and better DX
6. **Handle loading states** with Suspense and skeleton components

## 🔧 Configuration Examples

### Static Data Fetching
```typescript
// Default behavior - cached until manually invalidated
const { data } = await supabase.from('table').select()
```

### Dynamic Data Fetching
```typescript
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
```

### Revalidated Data
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

## 🎨 UI Components

All examples use Tailwind CSS for styling and include:
- Responsive design patterns
- Loading states and skeletons
- Error message displays
- Interactive elements
- Accessible markup

Visit each example page to see these patterns in action!
