# Prototype Runtime - Product Requirements Document

## 1. The Core Context

### Problem Statement

**Current Conditions:**
For **Factory developers** who have generated React components from ViewForge configurations, the following conditions exist:

1. **No execution environment** - Generated components are just files with nowhere to run
2. **No data connection** - Components expect data but have no Supabase connection
3. **No routing** - No way to navigate between generated views
4. **No state management** - Components are isolated, can't share state
5. **Build configuration hell** - Setting up React/Next.js/TypeScript/Tailwind repeatedly
6. **No visual validation** - Can't see if components actually work
7. **No stakeholder demos** - Nothing to show users for feedback

**Impacts of These Conditions:**
These conditions result in:
- **Can't prove prototypes work** - Generated code might have errors
- **Can't test with real data** - Don't know if Supabase queries are correct
- **Can't get user feedback** - Nothing visual to show
- **Violates factory vision** - Prototype Line should produce "Working App"
- **Manual setup pain** - Each developer recreates React environment
- **TypeScript/ESLint conflicts** - The "death by thousand cuts" returns
- **Slow iteration** - Can't quickly test changes

**Our Solution:**
The Prototype Runtime is a **pre-built, pre-configured React/Next.js application** that serves as a universal container for displaying generated components. It provides the execution environment, data connections, routing, and state management needed to run prototypes immediately after generation. This runtime is built ONCE and reused for ALL prototypes.

### Product Philosophy
The Prototype Runtime embodies: **"Generate and immediately see it working"**

### High-Level Goals & Metrics

1. **Zero Configuration Display**
   - **Metric:** Time from generation to viewing < 10 seconds
   - **Measurement:** Component generated → visible in browser

2. **Universal Component Support**
   - **Metric:** 100% of generated components displayable
   - **Measurement:** All ViewForge outputs work

3. **Real Data Integration**
   - **Metric:** Supabase connection working
   - **Measurement:** CRUD operations functional

4. **Conflict-Free Operation**
   - **Metric:** Zero TypeScript/ESLint errors
   - **Measurement:** No build failures

5. **Developer Experience**
   - **Metric:** One command to start
   - **Measurement:** `npm run dev` just works

## 2. User Personas

### Primary: Factory Developer
- **Job:** View generated prototypes immediately
- **Success:** See component working with real data
- **Pain Points:** Setting up React environment repeatedly

### Secondary: Stakeholder/User
- **Job:** Validate prototype meets requirements
- **Success:** Interact with working prototype
- **Pain Points:** Can't see or test generated UI

### Tertiary: Factory System
- **Job:** Complete the Prototype Line promise
- **Success:** "Working App" not just components
- **Pain Points:** Incomplete factory vision

## 3. Technical Specifications

### System Architecture
```
.pipeline/prototype-runtime/
├── package.json              # Pre-configured dependencies
├── next.config.js           # Next.js configuration
├── tsconfig.json           # TypeScript config (permissive)
├── .eslintrc.json          # ESLint (minimal rules)
├── tailwind.config.js      # Tailwind setup
├── .env.local              # Supabase connection
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── layout.tsx     # Root layout with navigation
│   │   ├── page.tsx       # Component gallery/index
│   │   └── [component]/   # Dynamic route for any component
│   │       └── page.tsx   # Component display wrapper
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client singleton
│   │   └── component-loader.ts  # Dynamic component importer
│   └── generated/         # Symlink to factory outputs
│       └── [components]   # All generated components
└── public/                # Static assets
```

### Core Features

#### Feature 1: Dynamic Component Loading
**Job:** Display any generated component without code changes

**Implementation:**
```typescript
// component-loader.ts
export async function loadComponent(name: string) {
  try {
    const module = await import(`@/generated/${name}`);
    return module.default || module[name];
  } catch (error) {
    return ErrorComponent;
  }
}
```

#### Feature 2: Automatic Route Generation
**Job:** Create routes for all generated components

**Implementation:**
```typescript
// app/[component]/page.tsx
export default async function ComponentPage({ 
  params 
}: { 
  params: { component: string } 
}) {
  const Component = await loadComponent(params.component);
  const data = await fetchComponentData(params.component);
  
  return <Component data={data} />;
}
```

#### Feature 3: Supabase Data Provider
**Job:** Provide real data to components

**Implementation:**
```typescript
// lib/supabase.ts
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Auto-detect data needs from component
export async function fetchComponentData(componentName: string) {
  const entity = detectEntity(componentName);
  const { data } = await supabase
    .from(entity)
    .select('*')
    .limit(10);
  return data;
}
```

#### Feature 4: Component Gallery
**Job:** Show all available components

**Implementation:**
```typescript
// app/page.tsx
export default function Gallery() {
  const components = scanGeneratedDirectory();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {components.map(comp => (
        <Link href={`/${comp.name}`}>
          <ComponentCard {...comp} />
        </Link>
      ))}
    </div>
  );
}
```

#### Feature 5: Hot Reload Integration
**Job:** Instantly reflect component changes

**Implementation:**
- Watch `.pipeline/generated/` directory
- Trigger Next.js fast refresh on changes
- No manual reload needed

#### Feature 6: Error Boundary Protection
**Job:** Prevent bad components from crashing runtime

**Implementation:**
```typescript
// Error boundary wraps each component
<ErrorBoundary fallback={<ComponentError />}>
  <GeneratedComponent />
</ErrorBoundary>
```

## 4. Non-Functional Requirements

### Performance
- Start time < 5 seconds
- Hot reload < 1 second
- Support 100+ components

### Reliability
- Graceful handling of malformed components
- Fallback UI for errors
- Never crashes entire runtime

### Compatibility
- Node.js 18+
- Works on Windows/Mac/Linux
- Supports all modern browsers

### Security
- Supabase RLS respected
- No credential exposure
- Read-only by default

## 5. Setup & Installation

### One-Time Setup (Factory Builder)
```bash
# Run setup script
cd .pipeline/factory-tools/prototype-runtime
./setup-runtime.sh

# This will:
# 1. Create Next.js app
# 2. Install dependencies
# 3. Configure TypeScript (permissive)
# 4. Setup Tailwind
# 5. Create component loader
# 6. Setup Supabase connection
```

### Daily Use (Factory User)
```bash
# Start the runtime
cd .pipeline/prototype-runtime
npm run dev

# Browser opens to http://localhost:3000
# All generated components automatically available
```

## 6. Success Criteria

### MVP (Sprint 2)
- [ ] Next.js app scaffolded
- [ ] Dynamic component loading working
- [ ] Basic routing to components
- [ ] Tailwind styles applied

### Enhanced (Sprint 3)
- [ ] Supabase connection working
- [ ] Component gallery page
- [ ] Error boundaries
- [ ] Hot reload working

### Complete (Sprint 4)
- [ ] Mock data generation
- [ ] State management
- [ ] Component composition
- [ ] Export functionality

## 7. Constraints & Principles

### Must Have
- Zero configuration for users
- Work with ANY generated component
- No TypeScript/ESLint conflicts
- Single source of truth (generated directory)

### Must Not Have
- Component-specific code in runtime
- Manual route configuration
- Build-time component imports
- Production optimizations (this is for prototypes)

### Principles
1. **Universal** - Works with any component
2. **Forgiving** - Handles errors gracefully
3. **Fast** - Instant feedback
4. **Simple** - No configuration needed

## 8. Example User Flow

```
1. Developer uses ViewForge → Generates AccountList.tsx
2. Component saved to .pipeline/generated/AccountList.tsx
3. Runtime detects new component (file watcher)
4. Developer navigates to http://localhost:3000/AccountList
5. Runtime dynamically imports AccountList.tsx
6. Runtime fetches account data from Supabase
7. Component renders with real data
8. Developer sees working prototype
9. Stakeholder provides feedback
10. Developer updates ViewForge config
11. Regenerates component
12. Changes appear instantly (hot reload)
```

## 9. Risk Mitigation

### Risk: TypeScript Conflicts
**Mitigation:** Ultra-permissive tsconfig with `skipLibCheck: true`

### Risk: Component Import Failures
**Mitigation:** Try-catch with fallback error component

### Risk: Supabase Connection Issues
**Mitigation:** Fallback to mock data when connection fails

### Risk: Performance with Many Components
**Mitigation:** Lazy loading, code splitting by default

## 10. Future Enhancements

### Phase 2
- Component composition playground
- State management panel
- Props editor UI
- Export to standalone app

### Phase 3
- Multi-tenant support
- Component versioning
- A/B testing framework
- Performance profiling

---

## Appendices

### A. Setup Script
```bash
#!/bin/bash
# setup-runtime.sh
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

npm install @supabase/supabase-js
npm install --save-dev @types/node

# Create permissive configs
echo "module.exports = { reactStrictMode: false }" > next.config.js
echo "{ 'extends': 'next', 'rules': {} }" > .eslintrc.json

# Create symlink to generated components
ln -s ../../generated src/generated
```

### B. Component Loader Implementation
```typescript
// Full implementation of dynamic loader
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const componentCache = new Map<string, ComponentType>();

export function loadComponent(name: string): ComponentType {
  if (!componentCache.has(name)) {
    const Component = dynamic(
      () => import(`@/generated/${name}`).catch(() => ErrorComponent),
      { 
        loading: () => <LoadingComponent />,
        ssr: false 
      }
    );
    componentCache.set(name, Component);
  }
  return componentCache.get(name)!;
}
```

---

*PRD Version: 1.0.0*
*Created: 2025-01-22*
*Status: Critical Gap - Needs Immediate Implementation*