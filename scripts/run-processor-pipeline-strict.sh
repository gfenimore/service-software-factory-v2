#!/bin/bash
# run-processor-pipeline-strict.sh
# Processor pipeline with STRICT validation - no more false positives!

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MANIFEST_PATH="${1:-.sdlc/05-backlog/A-accounts/master-view/processor-manifest.json}"
LOG_FILE="processor-run-$(date +%Y%m%d-%H%M%S).log"
CLAUDE_PATH="$HOME/AppData/Roaming/npm/claude"
VALIDATION_SCRIPT="scripts/validate-processor-output.js"

# STRICT MODE - Stop on first failure
set -e

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to validate single processor output
validate_processor_output() {
    local processor_index="$1"
    local processor_name="$2"
    local expected_output="$3"
    local target_file="$4"
    
    log "${BLUE}Validating processor output...${NC}"
    
    # Check which file to validate
    local file_to_check=""
    if [ ! -z "$expected_output" ] && [ "$expected_output" != "null" ]; then
        file_to_check="$expected_output"
    elif [ ! -z "$target_file" ] && [ "$target_file" != "null" ]; then
        file_to_check="$target_file"
    else
        log "${YELLOW}No output file to validate${NC}"
        return 0
    fi
    
    # Check if file exists
    if [ -f "$file_to_check" ]; then
        # Check if file is not empty
        if [ -s "$file_to_check" ]; then
            log "${GREEN}✓ Output validated: $file_to_check${NC}"
            return 0
        else
            log_error "File exists but is empty: $file_to_check"
            return 1
        fi
    else
        log_error "Expected file not created: $file_to_check"
        log_error "$processor_name claimed success but didn't create output!"
        
        # Look for similar files
        local dir=$(dirname "$file_to_check")
        local basename=$(basename "$file_to_check")
        log "${YELLOW}Looking for similar files in $dir:${NC}"
        ls -la "$dir" 2>/dev/null | grep -i "${basename:0:5}" | head -5 || true
        
        return 1
    fi
}

# Main execution
main() {
    log "${GREEN}🚀 Starting STRICT Processor Pipeline${NC}"
    log "Manifest: $MANIFEST_PATH"
    log "Validation: ENABLED (strict mode)"
    log "----------------------------------------"
    
    # Check manifest exists
    if [ ! -f "$MANIFEST_PATH" ]; then
        log_error "Manifest not found: $MANIFEST_PATH"
        exit 1
    fi
    
    # Check validation script exists
    if [ ! -f "$VALIDATION_SCRIPT" ]; then
        log_error "Validation script not found: $VALIDATION_SCRIPT"
        log "${YELLOW}Creating fallback validation...${NC}"
        VALIDATION_SCRIPT=""
    fi
    
    # Read manifest
    STORY=$(jq -r '.story' "$MANIFEST_PATH")
    SLICE=$(jq -r '.slice' "$MANIFEST_PATH")
    PROCESSOR_COUNT=$(jq '.processors | length' "$MANIFEST_PATH")
    
    log "Story: $STORY, Slice: $SLICE"
    log "Processors to run: $PROCESSOR_COUNT"
    log ""
    
    # Track results
    SUCCESS_COUNT=0
    FAILED_COUNT=0
    FAILED_PROCESSORS=()
    
    # Process each processor
    for i in $(seq 0 $((PROCESSOR_COUNT - 1))); do
        # Extract processor details
        SEQUENCE=$(jq -r ".processors[$i].sequence" "$MANIFEST_PATH")
        PROCESSOR=$(jq -r ".processors[$i].processor" "$MANIFEST_PATH")
        PURPOSE=$(jq -r ".processors[$i].purpose" "$MANIFEST_PATH")
        INPUT=$(jq -r ".processors[$i].input" "$MANIFEST_PATH")
        OUTPUT=$(jq -r ".processors[$i].output // empty" "$MANIFEST_PATH")
        TARGET=$(jq -r ".processors[$i].target_file // empty" "$MANIFEST_PATH")
        
        log "${YELLOW}[$SEQUENCE/$PROCESSOR_COUNT] Running $PROCESSOR${NC}"
        log "Purpose: $PURPOSE"
        [ ! -z "$OUTPUT" ] && [ "$OUTPUT" != "null" ] && log "Expected Output: $OUTPUT"
        [ ! -z "$TARGET" ] && [ "$TARGET" != "null" ] && log "Target File: $TARGET"
        
        # Build processor command
        case $PROCESSOR in
            "TYPE-PROCESSOR")
                INTERFACES=$(jq -r ".processors[$i].interfaces | join(', ')" "$MANIFEST_PATH")
                log "Creating interfaces: $INTERFACES"
                
                $CLAUDE_PATH -p "You are TYPE-PROCESSOR. Create TypeScript interfaces: $INTERFACES at $OUTPUT based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            "SCAFFOLD-PROCESSOR")
                COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
                log "Creating component: $COMPONENT"
                
                $CLAUDE_PATH -p "You are SCAFFOLD-PROCESSOR. Create component $COMPONENT at $OUTPUT based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            "HOOK-PROCESSOR")
                HOOK=$(jq -r ".processors[$i].hook" "$MANIFEST_PATH")
                log "Creating hook: $HOOK"
                
                $CLAUDE_PATH -p "You are HOOK-PROCESSOR. Create $HOOK at $OUTPUT based on $INPUT. IMPORTANT: You MUST create the actual hook file at $OUTPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            "API-PROCESSOR")
                log "Adding API integration"
                
                $CLAUDE_PATH -p "You are API-PROCESSOR. Add Supabase integration to $TARGET based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            "REACT-PROCESSOR")
                COMPONENT=$(jq -r ".processors[$i].component // empty" "$MANIFEST_PATH")
                log "Adding React logic to: ${COMPONENT:-component}"
                
                $CLAUDE_PATH -p "You are REACT-PROCESSOR. Add React logic to $TARGET based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            "MODIFY-PROCESSOR")
                log "Modifying: $TARGET"
                
                $CLAUDE_PATH -p "You are MODIFY-PROCESSOR. Update $TARGET as specified in $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
                
            *)
                log "Running generic processor: $PROCESSOR"
                $CLAUDE_PATH -p "You are $PROCESSOR. Execute based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                ;;
        esac
        
        PROCESSOR_EXIT_CODE=$?
        
        # STRICT VALIDATION - Check output immediately
        if [ $PROCESSOR_EXIT_CODE -eq 0 ]; then
            if validate_processor_output "$i" "$PROCESSOR" "$OUTPUT" "$TARGET"; then
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                log "${GREEN}✓ Processor $SEQUENCE completed and validated${NC}"
            else
                FAILED_COUNT=$((FAILED_COUNT + 1))
                FAILED_PROCESSORS+=("$PROCESSOR at sequence $SEQUENCE")
                log_error "Processor $SEQUENCE failed validation!"
                
                # STRICT MODE - Stop immediately
                log_error "Stopping pipeline due to validation failure"
                break
            fi
        else
            FAILED_COUNT=$((FAILED_COUNT + 1))
            FAILED_PROCESSORS+=("$PROCESSOR at sequence $SEQUENCE")
            log_error "Processor $SEQUENCE failed to execute!"
            break
        fi
        
        log ""
    done
    
    # Final validation with full script if available
    if [ ! -z "$VALIDATION_SCRIPT" ] && [ -f "$VALIDATION_SCRIPT" ]; then
        log "${BLUE}Running comprehensive validation...${NC}"
        if node "$VALIDATION_SCRIPT" "$MANIFEST_PATH"; then
            log "${GREEN}✓ Full validation passed${NC}"
        else
            log_error "Full validation failed!"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
    
    # Summary
    log ""
    log "========================================="
    log "${BLUE}Pipeline Summary${NC}"
    log "========================================="
    log "Successful: ${GREEN}$SUCCESS_COUNT${NC}/$PROCESSOR_COUNT"
    log "Failed: ${RED}$FAILED_COUNT${NC}/$PROCESSOR_COUNT"
    
    if [ ${#FAILED_PROCESSORS[@]} -gt 0 ]; then
        log ""
        log "${RED}Failed Processors:${NC}"
        for failed in "${FAILED_PROCESSORS[@]}"; do
            log "  - $failed"
        done
    fi
    
    log ""
    log "Log saved to: $LOG_FILE"
    
    # Exit with appropriate code
    if [ $FAILED_COUNT -eq 0 ]; then
        log "${GREEN}✅ Pipeline completed successfully with validation!${NC}"
        exit 0
    else
        log_error "❌ Pipeline failed - processors didn't create expected outputs"
        exit 1
    fi
}

# Run main function
main "$@"