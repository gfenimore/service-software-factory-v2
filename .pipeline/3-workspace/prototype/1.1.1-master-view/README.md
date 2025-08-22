# 1.1.1 Master View - PROTOTYPE Line

## Tech Stack Decision
**Framework**: Vanilla TypeScript + Web Components  
**Why**: Minimal complexity while meeting prototype requirements

## Structure
```
prototype/1.1.1-master-view/
├── src/
│   ├── components/
│   │   ├── AccountColumn.ts
│   │   ├── LocationColumn.ts
│   │   └── WorkOrderColumn.ts
│   ├── types/
│   │   ├── Account.ts
│   │   ├── Location.ts
│   │   └── WorkOrder.ts
│   ├── services/
│   │   └── DataService.ts
│   └── main.ts
├── tests/
│   ├── components/
│   └── services/
├── styles/
│   └── master-view.css
└── index.html
```

## Prototype Requirements (from factory-standards.yaml)
- ✅ TypeScript strict mode
- ✅ No `any` types allowed
- ✅ 60% test coverage
- ✅ CSS modules (as separate files)
- ✅ Basic error handling
- ✅ Loading states

## What Changes from Concept
1. **Types instead of any**
2. **Separate CSS files** instead of inline
3. **Error boundaries** for failed data loads
4. **Loading states** while fetching
5. **Unit tests** for all components

## What Stays the Same
1. **Three-column layout**
2. **Click flow** (Account → Location → Work Order)
3. **Mock data structure** (just typed now)
4. **Search functionality**
5. **Event communication pattern**