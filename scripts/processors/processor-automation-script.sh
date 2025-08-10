#!/bin/bash
# run-processor-pipeline.sh
# Executes processors based on the processor-manifest.json

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MANIFEST_PATH=".sdlc/05-backlog/A-accounts/master-view/processor-manifest.json"
LOG_FILE="processor-run-$(date +%Y%m%d-%H%M%S).log"
CLAUDE_PATH="~/AppData/Roaming/npm/claude"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to run validation
validate() {
    local validation_cmd="$1"
    log "${YELLOW}Validating: $validation_cmd${NC}"
    if eval "$validation_cmd" >> "$LOG_FILE" 2>&1; then
        log "${GREEN}✓ Validation passed${NC}"
        return 0
    else
        log "${RED}✗ Validation failed${NC}"
        return 1
    fi
}

# Check if manifest exists
if [ ! -f "$MANIFEST_PATH" ]; then
    log "${RED}Error: Processor manifest not found at $MANIFEST_PATH${NC}"
    exit 1
fi

# Read manifest
log "${GREEN}🚀 Starting Processor Pipeline${NC}"
log "Reading manifest from: $MANIFEST_PATH"

# Extract story and slice info
STORY=$(jq -r '.story' "$MANIFEST_PATH")
SLICE=$(jq -r '.slice' "$MANIFEST_PATH")
TOTAL_PROCESSORS=$(jq -r '.summary.total_processors' "$MANIFEST_PATH")

log "Story: $STORY, Slice: $SLICE"
log "Total processors to run: $TOTAL_PROCESSORS"
log "----------------------------------------"

# Process each processor in sequence
SUCCESS_COUNT=0
FAILED_COUNT=0

# Get total number of processors
PROCESSOR_COUNT=$(jq '.processors | length' "$MANIFEST_PATH")

for i in $(seq 0 $((PROCESSOR_COUNT - 1))); do
    # Extract processor details
    SEQUENCE=$(jq -r ".processors[$i].sequence" "$MANIFEST_PATH")
    PROCESSOR=$(jq -r ".processors[$i].processor" "$MANIFEST_PATH")
    PURPOSE=$(jq -r ".processors[$i].purpose" "$MANIFEST_PATH")
    INPUT=$(jq -r ".processors[$i].input" "$MANIFEST_PATH")
    OUTPUT=$(jq -r ".processors[$i].output" "$MANIFEST_PATH")
    VALIDATION=$(jq -r ".processors[$i].validation" "$MANIFEST_PATH")
    
    log "\n${YELLOW}[$SEQUENCE/$TOTAL_PROCESSORS] Running $PROCESSOR${NC}"
    log "Purpose: $PURPOSE"
    log "Input: $INPUT"
    log "Output: $OUTPUT"
    
    # Build the processor invocation based on processor type
    case $PROCESSOR in
        "TYPE-PROCESSOR")
            # Skip if already done
            if [ $SEQUENCE -eq 1 ] && [ -f "$OUTPUT" ]; then
                log "${GREEN}✓ TYPE-PROCESSOR already completed - skipping${NC}"
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                continue
            fi
            
            # Extract interfaces for TYPE-PROCESSOR
            INTERFACES=$(jq -r ".processors[$i].interfaces[]" "$MANIFEST_PATH" | tr '\n' ' ')
            log "Creating interfaces: $INTERFACES"
            
            # Build the prompt
            PROMPT="You are TYPE-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/type-processor.md

Process this input:
$INPUT

Extract ALL TypeScript interfaces:
$(echo "$INTERFACES" | sed 's/ /\n- /g' | sed 's/^/- /')

Output your result to:
$OUTPUT

Follow your prompt EXACTLY. Apply deterministic transformation rules only."
            
            # Execute Claude
            eval "$CLAUDE_PATH -p \"$PROMPT\" --allowedTools \"Read\" \"Write\" \"Edit\""
            ;;
            
        "SCAFFOLD-PROCESSOR")
            COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
            TASK=$(jq -r ".processors[$i].task" "$MANIFEST_PATH")
            log "Scaffolding component: $COMPONENT (Task: $TASK)"
            
            # Build the prompt
            PROMPT="You are SCAFFOLD-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/scaffold-processor.md

Process this input:
$INPUT
Component: $COMPONENT (Task $TASK)

Output your result to:
$OUTPUT

Follow your prompt EXACTLY. Apply deterministic transformation rules only."
            
            # Execute Claude
            eval "$CLAUDE_PATH -p \"$PROMPT\" --allowedTools \"Read\" \"Write\" \"Edit\""
            ;;
            
        "REACT-PROCESSOR")
            COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
            LOGIC_TYPE=$(jq -r ".processors[$i].logic_type" "$MANIFEST_PATH")
            log "Adding $LOGIC_TYPE logic to: $COMPONENT"
            
            # Build the prompt
            PROMPT="You are REACT-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/react-processor.md

Process this input:
$INPUT
Component: $COMPONENT
Logic Type: $LOGIC_TYPE

Add React logic to the existing component.

Follow your prompt EXACTLY. Apply deterministic transformation rules only."
            
            # Execute Claude
            eval "$CLAUDE_PATH -p \"$PROMPT\" --allowedTools \"Read\" \"Write\" \"Edit\""
            ;;
            
        "MODIFY-PROCESSOR")
            TARGET=$(jq -r ".processors[$i].target_file" "$MANIFEST_PATH")
            MODIFICATIONS=$(jq -r ".processors[$i].modifications[]" "$MANIFEST_PATH" | tr '\n' ';')
            log "Modifying: $TARGET"
            
            # Build the prompt
            PROMPT="You are MODIFY-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/modify-processor.md

Process this input:
EXISTING FILE: $TARGET
MODIFICATION TYPE: INTEGRATE_COMPONENTS
MODIFICATIONS: $MODIFICATIONS

Follow your prompt EXACTLY. Apply deterministic transformation rules only."
            
            # Execute Claude
            eval "$CLAUDE_PATH -p \"$PROMPT\" --allowedTools \"Read\" \"Write\" \"Edit\""
            ;;
    esac
    
    # Wait a moment for file system to catch up
    sleep 2
    
    # Run validation
    if [ "$VALIDATION" != "null" ]; then
        if validate "$VALIDATION"; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            log "${GREEN}✓ Processor completed successfully${NC}"
        else
            FAILED_COUNT=$((FAILED_COUNT + 1))
            log "${RED}✗ Processor failed validation${NC}"
            
            # Ask user if they want to continue
            read -p "Continue with remaining processors? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "${RED}Pipeline aborted by user${NC}"
                break
            fi
        fi
    else
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        log "${GREEN}✓ Processor completed (no validation required)${NC}"
    fi
done

# Final summary
log "\n========================================="
log "${GREEN}Pipeline Complete!${NC}"
log "Success: $SUCCESS_COUNT/$TOTAL_PROCESSORS"
log "Failed: $FAILED_COUNT/$TOTAL_PROCESSORS"
log "Log saved to: $LOG_FILE"

# Run final validation
FINAL_VALIDATION=$(jq -r '.execution_script.commands[-1]' "$MANIFEST_PATH")
log "\nRunning final validation: $FINAL_VALIDATION"
validate "$FINAL_VALIDATION"

# Generate completion report
REPORT_FILE="processor-report-$(date +%Y%m%d-%H%M%S).json"
cat > "$REPORT_FILE" << EOF
{
  "story": "$STORY",
  "slice": $SLICE,
  "execution_time": "$(date)",
  "processors_run": $TOTAL_PROCESSORS,
  "success_count": $SUCCESS_COUNT,
  "failed_count": $FAILED_COUNT,
  "log_file": "$LOG_FILE"
}
EOF

log "\nReport saved to: $REPORT_FILE"
log "${GREEN}🎉 Done!${NC}"