# Processor Pipeline Proposal for Claude Review

## 🎯 Goal
Transform concept HTML into prototype components using line-aware processors

## 📊 Current Situation

### We Have:
1. **Concept Output**: `1.1.1-master-view-CONCEPT.html` (working, monolithic)
2. **Existing Processors**: In `.sdlc/01-core/A-agents/processors/`
   - hook-processor.md
   - react-processor.md
   - test-processor.md
   - scaffold-processor.md
   - modify-processor.md
3. **Line Configurations**: Already defined in `processor-line-config.yaml`

### We Need:
- Processors that can transform concept → prototype → production
- Each processor should be line-aware
- Maintain artifact chain through the pipeline

## 🔧 Proposed Processor Pipeline

### Phase 1: Extraction & Analysis
**New Processors Needed:**

1. **EXTRACT-PROCESSOR** ✅ (Just created)
   - Breaks apart HTML into structure, styles, scripts, mock data
   - Foundation for all other processors

2. **ANALYZE-PROCESSOR** (Proposed)
   ```javascript
   // Input: extracted/scripts.js
   // Output: analysis/code-map.json
   {
     functions: [...],
     eventHandlers: [...],
     stateVariables: [...],
     domManipulations: [...],
     dataFlow: [...]
   }
   ```

### Phase 2: Type Generation
**Adapt Existing:**

3. **TYPE-PROCESSOR** (Exists in config, needs implementation)
   - Concept: Allow any
   - Prototype: Strict TypeScript
   - Production: Runtime validation (Zod)

### Phase 3: Component Generation
**New Processors Needed:**

4. **COMPONENT-PROCESSOR** (Proposed)
   ```javascript
   // Takes analysis + structure → generates components
   // Concept mode: Single file components
   // Prototype mode: Separate files with types
   // Production mode: With error boundaries
   ```

5. **SERVICE-PROCESSOR** (Proposed)
   ```javascript
   // Extracts data logic into services
   // Concept: Simple functions
   // Prototype: Classes with types
   // Production: With retry logic, caching
   ```

### Phase 4: Assembly
**New Processor Needed:**

6. **ASSEMBLY-PROCESSOR** (Proposed)
   ```javascript
   // Puts everything back together
   // Generates package.json, tsconfig, imports
   // Creates runnable prototype
   ```

## 🤔 Questions for Claude:

1. **Processor Granularity**: Should we have many small processors or fewer larger ones?

2. **Existing Processor Adaptation**: Should we modify existing processors like `react-processor.md` or create new line-aware versions?

3. **Artifact Chain**: How should processors pass artifacts between each other?
   ```
   Option A: File-based (each writes files for next)
   Option B: Memory-based (pass objects)
   Option C: Hybrid (files + metadata)
   ```

4. **Line Awareness Implementation**: 
   ```javascript
   // Option A: Single processor with modes
   class TypeProcessor {
     processForLine(input, line) {
       switch(line) {
         case 'concept': return this.conceptMode(input);
         case 'prototype': return this.prototypeMode(input);
         case 'production': return this.productionMode(input);
       }
     }
   }
   
   // Option B: Separate processors per line
   class ConceptTypeProcessor { }
   class PrototypeTypeProcessor { }
   class ProductionTypeProcessor { }
   
   // Option C: Configuration-driven
   class TypeProcessor {
     constructor(config) {
       this.rules = config[targetLine];
     }
   }
   ```

5. **Testing Strategy**: Should each processor have its own tests, or test the pipeline end-to-end?

## 📐 Proposed Architecture

```yaml
processor_framework:
  base_processor:
    - load_config()
    - validate_input()
    - process()
    - validate_output()
    - write_artifacts()
    
  line_awareness:
    concept:
      validation: minimal
      typing: loose
      output: working_code
      
    prototype:
      validation: typescript
      typing: strict
      output: components
      
    production:
      validation: runtime
      typing: branded
      output: hardened_code

  artifact_flow:
    each_processor:
      reads: previous_artifacts
      writes: 
        - output files
        - metadata.json
        - next-processor-hint.json
```

## 🎬 Proposed Next Steps

1. **Get Claude's feedback** on this proposal
2. **Build ANALYZE-PROCESSOR** to understand code structure
3. **Adapt TYPE-PROCESSOR** to be truly line-aware
4. **Build COMPONENT-PROCESSOR** for the core transformation
5. **Build ASSEMBLY-PROCESSOR** to create runnable prototype
6. **Test full pipeline** on Master View
7. **Iterate and refine**

## 💭 Key Design Decisions Needed

1. **Processor Communication**: How do processors share context?
2. **Error Handling**: What if a processor fails mid-pipeline?
3. **Partial Processing**: Can we run just some processors?
4. **Rollback**: How do we undo a failed transformation?
5. **Metrics**: What do we measure in the pipeline?

## 🔍 Specific Questions About Existing Processors

Looking at `.sdlc/01-core/A-agents/processors/`:

1. Should we use **react-processor.md** as-is or make it line-aware?
2. Is **scaffold-processor.md** our COMPONENT-PROCESSOR?
3. Should **test-processor.md** generate different tests per line?
4. Can **modify-processor.md** handle progressive transformations?

## 📊 Success Metrics

A successful processor pipeline should:
- Transform concept → prototype in < 5 minutes
- Generate TypeScript with 0 errors
- Achieve 60% test coverage automatically
- Maintain all concept functionality
- Be deterministic (same input = same output)

---

**For Claude**: What's your take on this approach? Should we focus on adapting existing processors or building new line-aware ones? What's the best way to handle the artifact chain between processors?