#!/bin/bash
# run-processor-pipeline.sh
# Executes processors based on the processor-manifest.json
# Now with Git integration for value slice commits

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Load from path-config.json
PATH_CONFIG=".sdlc/config/path-config.json"
if [ -f "$PATH_CONFIG" ] && command -v jq &> /dev/null; then
    MANIFEST_DIR=$(jq -r '.paths.manifestPath' "$PATH_CONFIG" | sed 's/\/$//')
    MANIFEST_PATH="${MANIFEST_DIR}/processor-manifest.json"
else
    # Fallback to defaults if config not found or jq not available
    MANIFEST_PATH=".sdlc/05-backlog/A-accounts/master-view/processor-manifest.json"
fi
LOG_FILE="processor-run-$(date +%Y%m%d-%H%M%S).log"
CLAUDE_PATH="$HOME/AppData/Roaming/npm/claude"

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

# Function to check git status
check_git_status() {
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        log "Files changed:"
        git status --short | tee -a "$LOG_FILE"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "${RED}Pipeline aborted - please commit or stash changes${NC}"
            exit 1
        fi
    fi
}

# Check if manifest exists
if [ ! -f "$MANIFEST_PATH" ]; then
    log "${RED}Error: Processor manifest not found at $MANIFEST_PATH${NC}"
    exit 1
fi

# Check git status before starting
log "${BLUE}🔍 Checking git status...${NC}"
check_git_status

# Read manifest
log "${GREEN}🚀 Starting Processor Pipeline${NC}"
log "Reading manifest from: $MANIFEST_PATH"

# Extract story and slice info
STORY=$(jq -r '.story' "$MANIFEST_PATH")
SLICE=$(jq -r '.slice' "$MANIFEST_PATH")
TOTAL_PROCESSORS=$(jq -r '.summary.total_processors' "$MANIFEST_PATH")
ARCH_DOC=$(jq -r '.architecture_doc' "$MANIFEST_PATH")

# Extract slice description from the architecture doc if possible
SLICE_DESC="Value Slice $SLICE"
if [ -f "$ARCH_DOC" ]; then
    # Try to extract slice description (this is a simple grep, could be improved)
    POSSIBLE_DESC=$(grep -A1 "Value Slice $SLICE" "$ARCH_DOC" | tail -n1 | sed 's/^[[:space:]]*//g')
    if [ ! -z "$POSSIBLE_DESC" ]; then
        SLICE_DESC="$POSSIBLE_DESC"
    fi
fi

log "Story: $STORY, Slice: $SLICE"
log "Description: $SLICE_DESC"
log "Total processors to run: $TOTAL_PROCESSORS"
log "----------------------------------------"

# Track files created/modified for git
CHANGED_FILES=()

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
    OUTPUT=$(jq -r ".processors[$i].output // empty" "$MANIFEST_PATH")
    TARGET=$(jq -r ".processors[$i].target_file // empty" "$MANIFEST_PATH")
    VALIDATION=$(jq -r ".processors[$i].validation" "$MANIFEST_PATH")
    
    log ""
    log "${YELLOW}[$SEQUENCE/$TOTAL_PROCESSORS] Running $PROCESSOR${NC}"
    log "Purpose: $PURPOSE"
    log "Input: $INPUT"
    [ ! -z "$OUTPUT" ] && log "Output: $OUTPUT"
    [ ! -z "$TARGET" ] && log "Target: $TARGET"
    
    # Store the file that will be created/modified
    if [ ! -z "$OUTPUT" ]; then
        CHANGED_FILES+=("$OUTPUT")
    elif [ ! -z "$TARGET" ]; then
        CHANGED_FILES+=("$TARGET")
    fi
    
    # Build the processor invocation based on processor type
    case $PROCESSOR in
        "TYPE-PROCESSOR")
            # Extract interfaces for TYPE-PROCESSOR
            INTERFACES=$(jq -r ".processors[$i].interfaces | join(', ')" "$MANIFEST_PATH")
            log "Creating interfaces: $INTERFACES"
            
            # Skip if already done
            if [ $SEQUENCE -eq 1 ] && [ -f "$OUTPUT" ]; then
                log "${GREEN}✓ TYPE-PROCESSOR already completed - skipping${NC}"
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                continue
            fi
            
            $CLAUDE_PATH -p "You are TYPE-PROCESSOR. Create TypeScript interfaces: $INTERFACES at $OUTPUT based on $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
            
        "SCAFFOLD-PROCESSOR")
            COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
            log "Component: $COMPONENT"
            
            $CLAUDE_PATH -p "You are SCAFFOLD-PROCESSOR. Create component $COMPONENT at $OUTPUT based on architecture in $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
            
        "HOOK-PROCESSOR")
            HOOK=$(jq -r ".processors[$i].hook" "$MANIFEST_PATH")
            log "Creating hook: $HOOK"
            
            $CLAUDE_PATH -p "You are HOOK-PROCESSOR. Create $HOOK at $OUTPUT based on $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
            
        "API-PROCESSOR")
            log "Adding API integration"
            
            $CLAUDE_PATH -p "You are API-PROCESSOR. Add Supabase integration to $TARGET based on $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
            
        "REACT-PROCESSOR")
            COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
            log "Adding React logic to: $COMPONENT"
            
            $CLAUDE_PATH -p "You are REACT-PROCESSOR. Add React logic to $TARGET based on $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
            
        "MODIFY-PROCESSOR")
            log "Modifying: $TARGET"
            
            $CLAUDE_PATH -p "You are MODIFY-PROCESSOR. Update $TARGET as specified in $INPUT" \
                --allowedTools "Read" "Write" "Edit"
            ;;
    esac
    
    # Wait a moment for file system
    sleep 2
    
    # Run validation if specified
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
                exit 1
            fi
        fi
    else
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        log "${GREEN}✓ Processor completed (no validation required)${NC}"
    fi
done

# Final summary
log ""
log "========================================="
log "${GREEN}Pipeline Complete!${NC}"
log "Success: $SUCCESS_COUNT/$TOTAL_PROCESSORS"
log "Failed: $FAILED_COUNT/$TOTAL_PROCESSORS"
log "Log saved to: $LOG_FILE"

# Run final validation
FINAL_VALIDATION=$(jq -r '.execution_script.commands[-1]' "$MANIFEST_PATH" 2>/dev/null || echo "npm run type-check")
if [ "$FINAL_VALIDATION" != "null" ]; then
    log ""
    log "Running final validation: $FINAL_VALIDATION"
    validate "$FINAL_VALIDATION"
fi

# Git integration - only if all processors succeeded
if [ $FAILED_COUNT -eq 0 ]; then
    log ""
    log "${BLUE}📦 Preparing Git commit...${NC}"
    
    # Show what files were created/modified
    log "Files created/modified:"
    printf '%s\n' "${CHANGED_FILES[@]}" | sort -u | tee -a "$LOG_FILE"
    
    # Stage the files
    git add "${CHANGED_FILES[@]}" "$MANIFEST_PATH" "$LOG_FILE"
    
    # Show git status
    log ""
    log "Git status:"
    git status --short | tee -a "$LOG_FILE"
    
    # Create commit message
    COMMIT_MSG="feat($STORY): implement $SLICE_DESC

- Processed $SUCCESS_COUNT processors successfully
- Architecture: $ARCH_DOC
- Log: $LOG_FILE

Automated by processor-pipeline"
    
    # Ask user to confirm commit
    log ""
    log "${BLUE}Proposed commit message:${NC}"
    echo "$COMMIT_MSG" | tee -a "$LOG_FILE"
    log ""
    
    read -p "Create commit? (y/n/e to edit message): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "$COMMIT_MSG"
        log "${GREEN}✓ Changes committed successfully${NC}"
        log "Commit hash: $(git rev-parse HEAD)"
    elif [[ $REPLY =~ ^[Ee]$ ]]; then
        # Let user edit the commit message
        git commit
        log "${GREEN}✓ Changes committed with custom message${NC}"
        log "Commit hash: $(git rev-parse HEAD)"
    else
        log "${YELLOW}⚠️  Commit skipped - changes remain staged${NC}"
        log "You can commit manually with: git commit -m \"your message\""
    fi
else
    log ""
    log "${YELLOW}⚠️  Git commit skipped due to failed processors${NC}"
    log "Please fix issues and commit manually"
fi

# Generate completion report
REPORT_FILE="processor-report-$(date +%Y%m%d-%H%M%S).json"
cat > "$REPORT_FILE" << EOF
{
  "story": "$STORY",
  "slice": $SLICE,
  "slice_description": "$SLICE_DESC",
  "execution_time": "$(date)",
  "processors_run": $TOTAL_PROCESSORS,
  "success_count": $SUCCESS_COUNT,
  "failed_count": $FAILED_COUNT,
  "files_changed": $(printf '%s\n' "${CHANGED_FILES[@]}" | jq -R . | jq -s .),
  "log_file": "$LOG_FILE",
  "committed": $([ $FAILED_COUNT -eq 0 ] && echo "true" || echo "false"),
  "commit_hash": "$(git rev-parse HEAD)"
}
EOF

log ""
log "Report saved to: $REPORT_FILE"
log "${GREEN}🎉 Done!${NC}"