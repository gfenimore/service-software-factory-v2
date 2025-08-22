# Concept Generator Learnings Document
*Sprint 1 Complete - Capturing insights for PRD updates*

## Process Learnings

### 1. Start with Real Configuration
**Learning:** Test with actual ViewForge output immediately, not hypothetical data.
- Used real ViewForge v3 export as test fixture
- Discovered field naming mismatches (accountName vs name)
- Fixed sample data to match actual field names
- Principle: Real data reveals real problems

### 2. Modular Generators Work
**Learning:** Separate generators for each layout type enables clean extension.
- table.js, list.js, detail.js are independent
- Easy to add new layout types without touching others
- Principle: Single responsibility at the module level

### 3. Sample Data Must Be Context-Aware
**Learning:** Generic sample data feels fake; field-specific data feels real.
- account.accountName → Company names
- serviceLocation.locationName → Office/facility names  
- Fallback to type-based only when no context
- Principle: Context makes data believable

## Technical Learnings

### 1. Zero Dependencies is Achievable
**Learning:** Pure Node.js is sufficient for HTML generation.
- No build step required
- No npm install needed
- Runs anywhere Node exists
- Principle: Simplicity enables portability

### 2. Semantic HTML Validates Intent
**Learning:** Proper HTML elements prove configuration completeness.
- `<table>` with `<thead>` and `<tbody>` for tables
- `<dl>`, `<dt>`, `<dd>` for field/value pairs
- `<fieldset>` with `<legend>` for grouped fields
- Principle: Structure communicates meaning

### 3. Metadata Enables Debugging
**Learning:** Rich metadata in output helps trace problems.
- Generation timestamp
- Configuration version
- Field count and types
- Complete hierarchy path
- Principle: Observability starts at generation

### 4. Black & White Enforces Clarity
**Learning:** No colors forces focus on structure and content.
- Can't hide bad layout with pretty colors
- Accessibility is automatic (high contrast)
- Print-friendly by default
- Principle: If it works in B&W, it works everywhere

## Architecture Learnings

### 1. Input Contract Must Match Reality
**Learning:** The generator contract must exactly match ViewForge output.
- Initial contract was idealized
- Real ViewForge output had different field names
- Had to update sample data mappings
- Principle: Contracts are discovered, not designed

### 2. Validation Before Generation
**Learning:** Fail fast with clear errors.
- validator.js checks structure before processing
- Clear error messages ("Missing fields array")
- Prevents cryptic generation failures
- Principle: Validate at the boundary

### 3. Parser Normalizes Variations
**Learning:** Parser layer handles configuration variations.
- Optional fields get defaults
- Missing hierarchy levels handled gracefully
- Consistent internal representation
- Principle: Normalize early, process consistently

## Sprint Metrics

### What Worked Well
- 45 minutes from start to working generator
- Clean module structure
- Immediate visual validation
- Real data made testing obvious

### What Could Improve
- Sample data could be more varied per row
- Error messages could suggest fixes
- Could add progress indicators for large configs

## Questions Answered

1. **Should we build all layouts at once?** Yes - they're simple enough and share infrastructure
2. **How smart should sample data be?** Very - context-aware data reveals configuration issues
3. **Do we need a build step?** No - pure Node.js is sufficient
4. **Should we validate strictly?** Yes - fail fast with clear errors

## What to Add to Concept Generator PRD

When we update the official PRD:

1. **Add sample data intelligence requirement** - Context-aware, not just type-based
2. **Specify semantic HTML elements** - Which elements for which layouts
3. **Define metadata requirements** - What must be included for traceability
4. **Add validation error catalog** - Specific errors and messages
5. **Include real ViewForge contract** - Not idealized version

## Next Sprint Questions

1. How will Prototype Line enhance this HTML?
2. Should we generate CSS classes for Prototype to hook into?
3. How do we handle pagination/sorting indicators?
4. Should generators share sample data pools?
5. How do we test generator output automatically?

---

*Sprint 1 Completed: 2025-01-22*
*Ready for PRD updates and Prototype Line*