#!/bin/bash
# run-processor-pipeline-validated.sh
# Enhanced processor pipeline with file validation and fail-fast behavior
# Ensures processors create exactly what they promise

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MANIFEST_PATH=".sdlc/05-backlog/A-accounts/master-view/processor-manifest.json"
LOG_FILE="processor-run-$(date +%Y%m%d-%H%M%S).log"
CLAUDE_PATH="$HOME/AppData/Roaming/npm/claude"
VALIDATION_REPORT="processor-validation-$(date +%Y%m%d-%H%M%S).json"

# Validation mode (strict or lenient)
VALIDATION_MODE="${VALIDATION_MODE:-strict}"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to validate file creation
validate_file_creation() {
    local expected_file="$1"
    local processor_name="$2"
    local sequence="$3"
    
    if [ -z "$expected_file" ] || [ "$expected_file" == "null" ]; then
        return 0  # No file expected
    fi
    
    log "${BLUE}Validating output: $expected_file${NC}"
    
    if [ -f "$expected_file" ]; then
        log "${GREEN}✓ File created successfully: $expected_file${NC}"
        
        # Check file is not empty
        if [ ! -s "$expected_file" ]; then
            log_warning "File is empty: $expected_file"
            if [ "$VALIDATION_MODE" == "strict" ]; then
                return 1
            fi
        fi
        
        # Log file stats
        local file_size=$(stat -c%s "$expected_file" 2>/dev/null || stat -f%z "$expected_file" 2>/dev/null || echo "unknown")
        local line_count=$(wc -l < "$expected_file" 2>/dev/null || echo "unknown")
        log "  Size: $file_size bytes, Lines: $line_count"
        
        return 0
    else
        log_error "Expected file not created: $expected_file"
        
        # Look for similar files that might have been created instead
        local dir=$(dirname "$expected_file")
        local basename=$(basename "$expected_file")
        local name_without_ext="${basename%.*}"
        
        log "Looking for similar files in $dir..."
        
        if [ -d "$dir" ]; then
            local similar_files=$(find "$dir" -maxdepth 1 -type f -name "*${name_without_ext:0:5}*" 2>/dev/null | head -5)
            
            if [ ! -z "$similar_files" ]; then
                log_warning "Found similar files that might have been created instead:"
                echo "$similar_files" | while read -r file; do
                    log "  - $file"
                done
            fi
        fi
        
        # Record failure in validation report
        echo "{\"sequence\": $sequence, \"processor\": \"$processor_name\", \"expected\": \"$expected_file\", \"status\": \"missing\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$VALIDATION_REPORT.tmp"
        
        if [ "$VALIDATION_MODE" == "strict" ]; then
            return 1
        else
            log_warning "Continuing despite missing file (lenient mode)"
            return 0
        fi
    fi
}

# Function to run pre-execution checks
run_pre_checks() {
    log "${MAGENTA}Running pre-execution checks...${NC}"
    
    local check_passed=true
    
    # Check 1: Manifest exists
    if [ ! -f "$MANIFEST_PATH" ]; then
        log_error "Manifest not found: $MANIFEST_PATH"
        check_passed=false
    else
        log "${GREEN}✓ Manifest found${NC}"
    fi
    
    # Check 2: Claude CLI is available
    if ! command -v "$CLAUDE_PATH" &> /dev/null && ! command -v claude &> /dev/null; then
        log_error "Claude CLI not found at: $CLAUDE_PATH"
        check_passed=false
    else
        log "${GREEN}✓ Claude CLI available${NC}"
    fi
    
    # Check 3: Required directories exist
    local required_dirs=("src/types" "src/components/accounts" "src/hooks" "src/lib")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_warning "Directory missing: $dir (will be created if needed)"
        fi
    done
    
    # Check 4: Node.js and npm available
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found"
        check_passed=false
    else
        log "${GREEN}✓ Node.js available ($(node --version))${NC}"
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm not found"
        check_passed=false
    else
        log "${GREEN}✓ npm available ($(npm --version))${NC}"
    fi
    
    # Check 5: Git repository status
    if git rev-parse --git-dir > /dev/null 2>&1; then
        log "${GREEN}✓ Git repository detected${NC}"
        
        # Check for uncommitted changes
        if ! git diff --quiet || ! git diff --cached --quiet; then
            log_warning "Uncommitted changes detected"
            git status --short | head -10 | tee -a "$LOG_FILE"
        fi
    else
        log_warning "Not a git repository"
    fi
    
    if [ "$check_passed" = false ]; then
        log_error "Pre-execution checks failed"
        return 1
    fi
    
    log "${GREEN}✓ All pre-execution checks passed${NC}"
    return 0
}

# Function to validate processor manifest
validate_manifest() {
    log "${MAGENTA}Validating manifest structure...${NC}"
    
    # Use jq to validate JSON structure
    if ! jq empty "$MANIFEST_PATH" 2>/dev/null; then
        log_error "Invalid JSON in manifest"
        return 1
    fi
    
    # Check required fields
    local story=$(jq -r '.story // empty' "$MANIFEST_PATH")
    local processors=$(jq -r '.processors // empty' "$MANIFEST_PATH")
    
    if [ -z "$story" ]; then
        log_error "Missing 'story' field in manifest"
        return 1
    fi
    
    if [ -z "$processors" ] || [ "$processors" == "null" ]; then
        log_error "Missing 'processors' field in manifest"
        return 1
    fi
    
    # Check each processor has required fields
    local processor_count=$(jq '.processors | length' "$MANIFEST_PATH")
    for i in $(seq 0 $((processor_count - 1))); do
        local proc_type=$(jq -r ".processors[$i].processor // empty" "$MANIFEST_PATH")
        local proc_purpose=$(jq -r ".processors[$i].purpose // empty" "$MANIFEST_PATH")
        
        if [ -z "$proc_type" ] || [ -z "$proc_purpose" ]; then
            log_error "Processor $i missing required fields"
            return 1
        fi
    done
    
    log "${GREEN}✓ Manifest validation passed${NC}"
    return 0
}

# Function to run validation command
run_validation() {
    local validation_cmd="$1"
    log "${YELLOW}Running validation: $validation_cmd${NC}"
    
    if eval "$validation_cmd" >> "$LOG_FILE" 2>&1; then
        log "${GREEN}✓ Validation passed${NC}"
        return 0
    else
        log_error "Validation failed: $validation_cmd"
        
        # Show last few lines of error
        tail -10 "$LOG_FILE" | grep -E "error|Error|ERROR" | head -5
        
        return 1
    fi
}

# Main execution starts here
main() {
    log "${GREEN}🚀 Starting Enhanced Processor Pipeline${NC}"
    log "Validation Mode: $VALIDATION_MODE"
    log "Log File: $LOG_FILE"
    log "----------------------------------------"
    
    # Initialize validation report
    echo "[" > "$VALIDATION_REPORT.tmp"
    
    # Run pre-execution checks
    if ! run_pre_checks; then
        log_error "Pre-execution checks failed. Aborting."
        exit 1
    fi
    
    # Validate manifest
    if ! validate_manifest; then
        log_error "Manifest validation failed. Aborting."
        exit 1
    fi
    
    # Read manifest details
    STORY=$(jq -r '.story' "$MANIFEST_PATH")
    SLICE=$(jq -r '.slice' "$MANIFEST_PATH")
    TOTAL_PROCESSORS=$(jq -r '.summary.total_processors // .processors | length' "$MANIFEST_PATH")
    
    log "Story: $STORY, Slice: $SLICE"
    log "Total processors to run: $TOTAL_PROCESSORS"
    log "=========================================="
    
    # Track results
    SUCCESS_COUNT=0
    FAILED_COUNT=0
    SKIPPED_COUNT=0
    FILES_CREATED=()
    FILES_MISSING=()
    
    # Process each processor
    PROCESSOR_COUNT=$(jq '.processors | length' "$MANIFEST_PATH")
    
    for i in $(seq 0 $((PROCESSOR_COUNT - 1))); do
        SEQUENCE=$(jq -r ".processors[$i].sequence" "$MANIFEST_PATH")
        PROCESSOR=$(jq -r ".processors[$i].processor" "$MANIFEST_PATH")
        PURPOSE=$(jq -r ".processors[$i].purpose" "$MANIFEST_PATH")
        INPUT=$(jq -r ".processors[$i].input" "$MANIFEST_PATH")
        OUTPUT=$(jq -r ".processors[$i].output // empty" "$MANIFEST_PATH")
        TARGET=$(jq -r ".processors[$i].target_file // empty" "$MANIFEST_PATH")
        VALIDATION=$(jq -r ".processors[$i].validation // empty" "$MANIFEST_PATH")
        
        log ""
        log "${YELLOW}[$SEQUENCE/$TOTAL_PROCESSORS] Running $PROCESSOR${NC}"
        log "Purpose: $PURPOSE"
        log "Input: $INPUT"
        [ ! -z "$OUTPUT" ] && [ "$OUTPUT" != "null" ] && log "Expected Output: $OUTPUT"
        [ ! -z "$TARGET" ] && [ "$TARGET" != "null" ] && log "Target File: $TARGET"
        
        # Check if input file exists
        if [ ! -f "$INPUT" ] && [ "$INPUT" != "null" ]; then
            log_error "Input file not found: $INPUT"
            if [ "$VALIDATION_MODE" == "strict" ]; then
                FAILED_COUNT=$((FAILED_COUNT + 1))
                continue
            fi
        fi
        
        # Build and execute processor command based on type
        PROCESSOR_SUCCESS=false
        
        case $PROCESSOR in
            "TYPE-PROCESSOR")
                INTERFACES=$(jq -r ".processors[$i].interfaces | join(', ')" "$MANIFEST_PATH")
                log "Creating interfaces: $INTERFACES"
                
                $CLAUDE_PATH -p "You are TYPE-PROCESSOR. Create TypeScript interfaces: $INTERFACES at $OUTPUT based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                
                if [ $? -eq 0 ]; then
                    PROCESSOR_SUCCESS=true
                fi
                ;;
                
            "SCAFFOLD-PROCESSOR")
                COMPONENT=$(jq -r ".processors[$i].component" "$MANIFEST_PATH")
                log "Creating component: $COMPONENT"
                
                $CLAUDE_PATH -p "You are SCAFFOLD-PROCESSOR. Create component $COMPONENT at $OUTPUT based on architecture in $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                
                if [ $? -eq 0 ]; then
                    PROCESSOR_SUCCESS=true
                fi
                ;;
                
            "HOOK-PROCESSOR")
                HOOK=$(jq -r ".processors[$i].hook" "$MANIFEST_PATH")
                log "Creating hook: $HOOK"
                
                $CLAUDE_PATH -p "You are HOOK-PROCESSOR. Create $HOOK at $OUTPUT based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                
                if [ $? -eq 0 ]; then
                    PROCESSOR_SUCCESS=true
                fi
                ;;
                
            *)
                # Generic processor handling
                $CLAUDE_PATH -p "You are $PROCESSOR. Execute task based on $INPUT" \
                    --allowedTools "Read" "Write" "Edit"
                
                if [ $? -eq 0 ]; then
                    PROCESSOR_SUCCESS=true
                fi
                ;;
        esac
        
        # Validate output file was created
        if [ ! -z "$OUTPUT" ] && [ "$OUTPUT" != "null" ]; then
            if validate_file_creation "$OUTPUT" "$PROCESSOR" "$SEQUENCE"; then
                FILES_CREATED+=("$OUTPUT")
            else
                FILES_MISSING+=("$OUTPUT")
                PROCESSOR_SUCCESS=false
            fi
        fi
        
        # Run specified validation if any
        if [ ! -z "$VALIDATION" ] && [ "$VALIDATION" != "null" ]; then
            if ! run_validation "$VALIDATION"; then
                PROCESSOR_SUCCESS=false
            fi
        fi
        
        # Update counters
        if [ "$PROCESSOR_SUCCESS" = true ]; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            log "${GREEN}✓ Processor completed successfully${NC}"
        else
            FAILED_COUNT=$((FAILED_COUNT + 1))
            log_error "Processor failed"
            
            if [ "$VALIDATION_MODE" == "strict" ]; then
                log_error "Aborting pipeline due to failure (strict mode)"
                break
            fi
        fi
        
        # Brief pause between processors
        sleep 1
    done
    
    # Finalize validation report
    echo "]" >> "$VALIDATION_REPORT.tmp"
    mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
    
    # Final summary
    log ""
    log "=========================================="
    log "${BLUE}Pipeline Execution Summary${NC}"
    log "=========================================="
    log "Successful: ${GREEN}$SUCCESS_COUNT${NC}/$TOTAL_PROCESSORS"
    log "Failed: ${RED}$FAILED_COUNT${NC}/$TOTAL_PROCESSORS"
    log "Skipped: ${YELLOW}$SKIPPED_COUNT${NC}/$TOTAL_PROCESSORS"
    
    if [ ${#FILES_CREATED[@]} -gt 0 ]; then
        log ""
        log "${GREEN}Files Created:${NC}"
        printf '%s\n' "${FILES_CREATED[@]}" | while read -r file; do
            log "  ✓ $file"
        done
    fi
    
    if [ ${#FILES_MISSING[@]} -gt 0 ]; then
        log ""
        log "${RED}Files Missing:${NC}"
        printf '%s\n' "${FILES_MISSING[@]}" | while read -r file; do
            log "  ✗ $file"
        done
    fi
    
    log ""
    log "Validation Report: $VALIDATION_REPORT"
    log "Full Log: $LOG_FILE"
    
    # Run post-pipeline validation
    if command -v node &> /dev/null && [ -f "scripts/validate-processor-output.js" ]; then
        log ""
        log "${BLUE}Running post-pipeline validation...${NC}"
        node scripts/validate-processor-output.js "$MANIFEST_PATH"
    fi
    
    # Exit with appropriate code
    if [ $FAILED_COUNT -eq 0 ]; then
        log ""
        log "${GREEN}🎉 Pipeline completed successfully!${NC}"
        exit 0
    else
        log ""
        log "${RED}⚠️  Pipeline completed with failures${NC}"
        exit 1
    fi
}

# Run main function
main "$@"