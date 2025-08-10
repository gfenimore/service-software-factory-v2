#!/bin/bash
# run-slice.sh
# Slice-aware pipeline runner that eliminates manual manifest copying

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
WORK_DIR=".sdlc/current-work"
MANIFEST_DIR=".sdlc/05-backlog/A-accounts/master-view"
SLICE_DATA="$WORK_DIR/value-slices.json"
CURRENT_SLICE_FILE="$WORK_DIR/current-slice.json"
LOG_FILE="slice-run-$(date +%Y%m%d-%H%M%S).log"

# Parse arguments
SLICE_NUM=""
DRY_RUN=false

if [ "$1" == "--next" ]; then
    # Get next slice from tracking
    if [ -f "$SLICE_DATA" ]; then
        SLICE_NUM=$(jq -r '.currentSlice' "$SLICE_DATA")
        echo -e "${CYAN}Running next slice: $SLICE_NUM${NC}"
    else
        echo -e "${RED}No slice data found. Run extract-value-slices.js first${NC}"
        exit 1
    fi
elif [ "$1" == "--current" ]; then
    # Re-run current slice
    if [ -f "$CURRENT_SLICE_FILE" ]; then
        SLICE_NUM=$(jq -r '.slice' "$CURRENT_SLICE_FILE")
        echo -e "${CYAN}Re-running current slice: $SLICE_NUM${NC}"
    else
        echo -e "${YELLOW}No current slice recorded, using next${NC}"
        SLICE_NUM=$(jq -r '.currentSlice' "$SLICE_DATA")
    fi
elif [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    SLICE_NUM="$2"
elif [[ "$1" =~ ^[0-9]+$ ]]; then
    SLICE_NUM="$1"
else
    echo "Usage: $0 <slice-number> | --next | --current | --dry-run <number>"
    echo ""
    echo "Examples:"
    echo "  $0 3              # Run value slice 3"
    echo "  $0 --next         # Run next pending slice"
    echo "  $0 --current      # Re-run current slice"
    echo "  $0 --dry-run 2    # Show what would happen"
    exit 1
fi

# Validate slice number
if [ -z "$SLICE_NUM" ]; then
    echo -e "${RED}No slice number specified${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   Slice-Aware Pipeline Runner${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Load slice information
if [ -f "$SLICE_DATA" ]; then
    STORY=$(jq -r '.story' "$SLICE_DATA")
    SLICE_NAME=$(jq -r ".slices[] | select(.number == $SLICE_NUM) | .name" "$SLICE_DATA")
    SLICE_TASKS=$(jq -r ".slices[] | select(.number == $SLICE_NUM) | .tasks | join(\", \")" "$SLICE_DATA")
    USER_VALUE=$(jq -r ".slices[] | select(.number == $SLICE_NUM) | .userValue" "$SLICE_DATA")
    
    if [ -z "$SLICE_NAME" ]; then
        echo -e "${RED}Slice $SLICE_NUM not found in slice data${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}Story:${NC} $STORY"
    echo -e "${CYAN}Slice $SLICE_NUM:${NC} $SLICE_NAME"
    echo -e "${CYAN}Tasks:${NC} $SLICE_TASKS"
    echo -e "${CYAN}User Value:${NC} $USER_VALUE"
else
    echo -e "${YELLOW}Warning: No slice data found${NC}"
    STORY="Unknown"
    SLICE_NAME="Slice $SLICE_NUM"
fi

echo ""

# Check for manifest
SLICE_MANIFEST="$MANIFEST_DIR/processor-manifest-vs${SLICE_NUM}.json"
TARGET_MANIFEST="$MANIFEST_DIR/processor-manifest.json"

if [ ! -f "$SLICE_MANIFEST" ]; then
    echo -e "${RED}✗ Manifest not found: processor-manifest-vs${SLICE_NUM}.json${NC}"
    echo ""
    echo -e "${YELLOW}This slice needs a manifest before it can run.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the tasks for this slice in us-*-tasks.md"
    echo "2. Run processor-selector to create the manifest:"
    echo "   claude -p \"You are PROCESSOR-SELECTOR. Create manifest for slice $SLICE_NUM\""
    echo "3. Save as: $SLICE_MANIFEST"
    echo "4. Run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Found manifest: processor-manifest-vs${SLICE_NUM}.json${NC}"

# Get processor count from manifest
PROCESSOR_COUNT=$(jq '.processors | length' "$SLICE_MANIFEST")
echo -e "${CYAN}Processors to run:${NC} $PROCESSOR_COUNT"

# Estimate time (5 seconds per processor + overhead)
ESTIMATED_TIME=$((PROCESSOR_COUNT * 5 + 10))
echo -e "${CYAN}Estimated time:${NC} ~${ESTIMATED_TIME} seconds"

echo ""

# Dry run mode
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE - Showing what would happen:${NC}"
    echo ""
    echo "1. Copy $SLICE_MANIFEST → $TARGET_MANIFEST"
    echo "2. Run pipeline with validated output checks"
    echo "3. Run test twin generation"
    echo "4. Update tracking files"
    echo "5. Generate completion report"
    echo ""
    echo "Processors that would run:"
    jq -r '.processors[] | "  - \(.processor) for \(.purpose)"' "$SLICE_MANIFEST"
    echo ""
    exit 0
fi

# Confirm before running
echo -e "${YELLOW}Ready to run slice $SLICE_NUM${NC}"
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
fi

echo ""

# START EXECUTION
START_TIME=$(date +%s)

# Step 1: Copy manifest
echo -e "${BLUE}[1/5] Preparing manifest...${NC}"
cp "$SLICE_MANIFEST" "$TARGET_MANIFEST"
echo -e "${GREEN}✓ Copied to processor-manifest.json${NC}"

# Step 2: Update current slice tracking
echo -e "${BLUE}[2/5] Updating tracking...${NC}"
cat > "$CURRENT_SLICE_FILE" <<EOF
{
  "story": "$STORY",
  "slice": $SLICE_NUM,
  "name": "$SLICE_NAME",
  "status": "running",
  "startTime": "$(date -Iseconds)"
}
EOF
echo -e "${GREEN}✓ Updated current-slice.json${NC}"

# Step 3: Run the pipeline
echo -e "${BLUE}[3/5] Running pipeline...${NC}"
echo ""

# Check which pipeline script to use - PREFER STRICT MODE
if [ -f "./scripts/run-processor-pipeline-strict.sh" ]; then
    PIPELINE_SCRIPT="./scripts/run-processor-pipeline-strict.sh"
    echo "Using: STRICT pipeline (stops on missing files)"
elif [ -f "./scripts/run-pipeline-with-test-twins.sh" ]; then
    PIPELINE_SCRIPT="./scripts/run-pipeline-with-test-twins.sh"
    echo "Using: Pipeline with test twins"
elif [ -f "./scripts/run-processor-pipeline-validated.sh" ]; then
    PIPELINE_SCRIPT="./scripts/run-processor-pipeline-validated.sh"
    echo "Using: Validated pipeline"
elif [ -f "./run-processor-pipeline.sh" ]; then
    PIPELINE_SCRIPT="./run-processor-pipeline.sh"
    echo "Using: Standard pipeline"
else
    echo -e "${RED}No pipeline script found!${NC}"
    exit 1
fi

# Run the pipeline
echo "Executing: $PIPELINE_SCRIPT"
echo "Log: $LOG_FILE"
echo ""

if $PIPELINE_SCRIPT >> "$LOG_FILE" 2>&1; then
    echo -e "${GREEN}✓ Pipeline completed successfully${NC}"
    PIPELINE_SUCCESS=true
else
    echo -e "${RED}✗ Pipeline failed - check $LOG_FILE${NC}"
    PIPELINE_SUCCESS=false
fi

# Step 4: Update completion status
echo -e "${BLUE}[4/5] Updating status...${NC}"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

cat > "$CURRENT_SLICE_FILE" <<EOF
{
  "story": "$STORY",
  "slice": $SLICE_NUM,
  "name": "$SLICE_NAME",
  "status": "$( [ "$PIPELINE_SUCCESS" = true ] && echo "completed" || echo "failed" )",
  "startTime": "$(date -Iseconds -d @$START_TIME)",
  "endTime": "$(date -Iseconds)",
  "duration": $DURATION
}
EOF

# Update slice data if successful
if [ "$PIPELINE_SUCCESS" = true ]; then
    # Mark slice as completed in value-slices.json
    if [ -f "$SLICE_DATA" ]; then
        jq ".slices |= map(if .number == $SLICE_NUM then .status = \"completed\" else . end)" "$SLICE_DATA" > "$SLICE_DATA.tmp"
        mv "$SLICE_DATA.tmp" "$SLICE_DATA"
        
        # Update current slice to next pending
        NEXT_SLICE=$(jq -r '.slices[] | select(.status == "pending" or .status == "ready") | .number' "$SLICE_DATA" | head -1)
        if [ ! -z "$NEXT_SLICE" ]; then
            jq ".currentSlice = $NEXT_SLICE" "$SLICE_DATA" > "$SLICE_DATA.tmp"
            mv "$SLICE_DATA.tmp" "$SLICE_DATA"
        fi
    fi
    echo -e "${GREEN}✓ Slice $SLICE_NUM marked as completed${NC}"
fi

# Step 5: Generate report
echo -e "${BLUE}[5/5] Generating report...${NC}"

REPORT_FILE="$WORK_DIR/slice-${SLICE_NUM}-report.md"
cat > "$REPORT_FILE" <<EOF
# Value Slice $SLICE_NUM Execution Report

## Summary
- **Story**: $STORY
- **Slice**: $SLICE_NUM - $SLICE_NAME
- **Duration**: $DURATION seconds
- **Status**: $( [ "$PIPELINE_SUCCESS" = true ] && echo "✅ SUCCESS" || echo "❌ FAILED" )
- **Processors**: $PROCESSOR_COUNT executed

## User Value Delivered
$USER_VALUE

## Performance Metrics
- Start: $(date -Iseconds -d @$START_TIME)
- End: $(date -Iseconds)
- Total Duration: $DURATION seconds
- Average per Processor: $((DURATION / PROCESSOR_COUNT)) seconds

## Files Created
See $LOG_FILE for detailed file list

## Next Steps
EOF

if [ "$PIPELINE_SUCCESS" = true ]; then
    if [ ! -z "$NEXT_SLICE" ]; then
        echo "Run next slice: ./scripts/run-slice.sh --next" >> "$REPORT_FILE"
    else
        echo "All slices completed! 🎉" >> "$REPORT_FILE"
    fi
else
    echo "1. Check $LOG_FILE for errors" >> "$REPORT_FILE"
    echo "2. Fix issues and re-run: ./scripts/run-slice.sh --current" >> "$REPORT_FILE"
fi

echo -e "${GREEN}✓ Report saved to: $REPORT_FILE${NC}"

# Final summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}          Execution Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ "$PIPELINE_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Slice $SLICE_NUM completed successfully!${NC}"
    echo ""
    echo "Duration: $DURATION seconds"
    echo "Report: $REPORT_FILE"
    echo "Log: $LOG_FILE"
    
    if [ ! -z "$NEXT_SLICE" ]; then
        echo ""
        echo -e "${CYAN}Next: ./scripts/run-slice.sh --next (Slice $NEXT_SLICE)${NC}"
    fi
else
    echo -e "${RED}❌ Slice $SLICE_NUM failed${NC}"
    echo ""
    echo "Check the log for details: $LOG_FILE"
    echo "After fixing, re-run: ./scripts/run-slice.sh --current"
fi

echo ""