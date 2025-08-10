# Processor Pipeline Validation System

## Overview
This validation system ensures processor pipelines create exactly what they promise, preventing false success reports and missing file issues.

## Problem Solved
Previously, processors could report "success" without actually creating the expected files. This led to:
- False positives in pipeline execution
- Missing dependencies causing runtime failures
- Time wasted debugging "successful" runs
- Loss of trust in automation

## Components

### 1. Pre-Validation (`pre-validate-manifest.js`)
**Purpose**: Catch issues before running processors

**Checks**:
- Input files exist and are not empty
- No path conflicts (duplicate outputs)
- Target files exist for modification operations
- Parent directories exist for new files
- Naming conventions are followed

**Usage**:
```bash
node scripts/pre-validate-manifest.js [manifest-path]
```

### 2. Enhanced Pipeline (`run-processor-pipeline-validated.sh`)
**Purpose**: Run processors with real-time validation

**Features**:
- Pre-execution environment checks
- File creation validation after each processor
- Fail-fast mode (strict) or continue-on-error (lenient)
- Detailed logging of actual vs expected outputs
- Automatic rollback suggestions on failure

**Usage**:
```bash
# Strict mode (default) - stops on first failure
./scripts/run-processor-pipeline-validated.sh

# Lenient mode - continues despite failures
VALIDATION_MODE=lenient ./scripts/run-processor-pipeline-validated.sh
```

### 3. Post-Validation (`validate-processor-output.js`)
**Purpose**: Verify all expected outputs exist after pipeline completion

**Features**:
- Compares manifest expectations to actual files
- Finds and suggests similar files that might have been created
- Generates detailed JSON report
- Returns proper exit codes for CI/CD integration

**Usage**:
```bash
node scripts/validate-processor-output.js [manifest-path]
```

### 4. Test Suite (`test-validation-tools.sh`)
**Purpose**: Quick validation of current state

**Usage**:
```bash
./scripts/test-validation-tools.sh
```

## Validation Workflow

### Step 1: Pre-Validate
```bash
node scripts/pre-validate-manifest.js
```
Fix any errors before proceeding.

### Step 2: Run Enhanced Pipeline
```bash
./scripts/run-processor-pipeline-validated.sh
```
Monitor real-time validation as processors run.

### Step 3: Post-Validate
```bash
node scripts/validate-processor-output.js
```
Verify all expected files were created.

## Key Improvements

### Before
```bash
[1/8] Running TYPE-PROCESSOR
✓ Processor completed  # But file wasn't created!
```

### After
```bash
[1/8] Running TYPE-PROCESSOR
Validating output: src/types/account.types.ts
✗ ERROR: Expected file not created: src/types/account.types.ts
  Found similar files:
    - src/types/accountDetails.types.ts
✗ Processor failed
```

## Configuration

### Validation Modes
- **strict** (default): Stop on first failure
- **lenient**: Continue despite failures, report at end

### Environment Variables
```bash
VALIDATION_MODE=strict|lenient
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Validate Manifest
  run: node scripts/pre-validate-manifest.js
  
- name: Run Processors
  run: ./scripts/run-processor-pipeline-validated.sh
  env:
    VALIDATION_MODE: strict
    
- name: Verify Outputs
  run: node scripts/validate-processor-output.js
```

## Error Recovery

### When Processors Fail
1. Check the validation report for specific issues
2. Look for "similar files" suggestions
3. Review processor logs for actual vs expected paths
4. Fix manifest or processor prompts as needed
5. Re-run with validation

### Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| File already exists | Processor trying to create existing file | Check if should modify instead |
| Target file missing | Modification target doesn't exist | Create file first or fix path |
| Wrong file name | Processor created different name | Update manifest to match actual |
| Empty input | Input file has no content | Populate input file |

## Reports Generated

### Validation Report (JSON)
```json
{
  "timestamp": "2025-01-09T20:00:00Z",
  "manifest": "path/to/manifest.json",
  "summary": {
    "total": 8,
    "passed": 6,
    "failed": 2
  },
  "details": [...]
}
```

### Pipeline Log
- Detailed execution trace
- File creation attempts
- Validation results
- Error messages

## Best Practices

1. **Always pre-validate** before running processors
2. **Use strict mode** for production pipelines
3. **Review validation reports** even on success
4. **Keep manifests in sync** with actual file structure
5. **Document path changes** when processors adapt

## Troubleshooting

### Q: Processor says success but file missing?
A: Check if processor created file with different name. Look for "similar files" in validation output.

### Q: Pipeline keeps failing on same processor?
A: Run pre-validation to check if input files exist and are valid.

### Q: How to handle existing files?
A: Either delete them first, or change processor to MODIFY instead of CREATE.

### Q: Validation passes but app breaks?
A: Check that processors created correct content, not just files. Validation only checks existence.

## Future Enhancements
- [ ] Content validation (not just existence)
- [ ] Automatic path correction suggestions
- [ ] Processor output standardization
- [ ] Visual diff of expected vs actual
- [ ] Automatic rollback on failure

## Support
For issues or improvements, check:
- `.sdlc/validation/investigations/` - Investigation reports
- `processor-run-*.log` - Execution logs
- `validation-report-*.json` - Validation results