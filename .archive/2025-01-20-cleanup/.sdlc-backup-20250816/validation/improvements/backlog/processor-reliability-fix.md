# Fix Processor Reliability - Prevent False Success

## Problem

Processors (especially HOOK-PROCESSOR) are reporting success without creating files. This breaks trust in our automation.

## Root Cause

The invoke-processor.sh script relies on Claude CLI exit codes, but Claude CLI returns success even when no files are created.

## Solution

Enhance the pipeline to VERIFY outputs after EVERY processor run.

## Implementation Tasks

### 1. Update run-pipeline-with-test-twins.sh

Add validation after each processor:

```bash
# After running processor
if [ "$OUTPUT_FILE" != "null" ] && [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ ERROR: Processor claimed success but file not created: $OUTPUT_FILE"
    echo "Pipeline STOPPED - fix processor before continuing"
    exit 1
fi
```

### 2. Create processor-wrapper.sh

A wrapper that:

- Runs the processor
- Checks expected outputs exist
- Only reports success if files are created

```bash
#!/bin/bash
# processor-wrapper.sh
PROCESSOR=$1
TASK=$2
EXPECTED_OUTPUT=$3

# Run processor
./invoke-processor.sh $PROCESSOR $TASK

# Verify output
if [ ! -f "$EXPECTED_OUTPUT" ]; then
    echo "❌ Processor $PROCESSOR failed to create $EXPECTED_OUTPUT"
    exit 1
fi

echo "✅ Verified: $EXPECTED_OUTPUT exists"
```

### 3. Add Pre-Processor State Capture

Before each processor:

```bash
# Capture file state before processor
ls -la src/hooks/ > before-processor.txt

# Run processor
./processor-wrapper.sh HOOK-PROCESSOR T-009 src/hooks/useAccountSelection.ts

# Compare after
ls -la src/hooks/ > after-processor.txt
diff before-processor.txt after-processor.txt
```

### 4. Integrate Validation into Pipeline

Modify the pipeline to:

1. Run pre-validation
2. Execute processor
3. Run post-validation
4. STOP if validation fails

### 5. Create Processor Health Report

After each run, generate:

```json
{
  "processor": "HOOK-PROCESSOR",
  "task": "T-009",
  "expected_output": "src/hooks/useAccountSelection.ts",
  "actual_output": null,
  "status": "FAILED",
  "false_positive": true,
  "timestamp": "2025-01-09T20:14:00Z"
}
```

## Success Criteria

1. ✅ Pipeline STOPS when processors don't create files
2. ✅ Clear error messages show what's missing
3. ✅ No more false positives
4. ✅ Health reports show processor reliability

## Testing

1. Create a test manifest that expects a specific file
2. Run a processor that won't create it
3. Verify pipeline stops with clear error
4. Fix and re-run - verify success

## Prevention

Add to processor documentation:

- Processors MUST create expected outputs
- Exit codes alone don't indicate success
- Validation is mandatory, not optional

---

This fix ensures we can trust our automation again. No more discovering missing functionality after "successful" runs!
