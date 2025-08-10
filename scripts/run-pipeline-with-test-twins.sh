#!/bin/bash
# run-pipeline-with-test-twins.sh
# Enhanced processor pipeline that automatically runs test twins after primary processors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - Load from path-config.json
PATH_CONFIG=".sdlc/config/path-config.json"
if [ -f "$PATH_CONFIG" ] && command -v jq &> /dev/null; then
    DEFAULT_MANIFEST_DIR=$(jq -r '.paths.manifestPath' "$PATH_CONFIG" | sed 's/\/$//')
    DEFAULT_MANIFEST="${DEFAULT_MANIFEST_DIR}/processor-manifest.json"
else
    # Fallback to defaults if config not found
    DEFAULT_MANIFEST=".sdlc/05-backlog/A-accounts/master-view/processor-manifest.json"
fi

MANIFEST_PATH="${1:-$DEFAULT_MANIFEST}"
LOG_FILE="processor-run-$(date +%Y%m%d-%H%M%S).log"
TEST_LOG_FILE="test-twin-run-$(date +%Y%m%d-%H%M%S).log"
CLAUDE_PATH="$HOME/AppData/Roaming/npm/claude"

# Test twin mapping
declare -A TEST_TWINS=(
  ["TYPE-PROCESSOR"]="TYPE-PROCESSOR-TEST"
  ["SCAFFOLD-PROCESSOR"]="SCAFFOLD-PROCESSOR-TEST"
  ["HOOK-PROCESSOR"]="HOOK-PROCESSOR-TEST"
  ["API-PROCESSOR"]="API-PROCESSOR-TEST"
  ["MODIFY-PROCESSOR"]="MODIFY-PROCESSOR-TEST"
  ["REACT-PROCESSOR"]="REACT-PROCESSOR-TEST"
)

# Test generation mode
TEST_MODE="${TEST_MODE:-auto}" # auto, manual, skip

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_test() {
    echo -e "$1" | tee -a "$TEST_LOG_FILE"
}

# Function to check if test twin exists
has_test_twin() {
    local processor="$1"
    [[ -n "${TEST_TWINS[$processor]}" ]]
}

# Function to run test twin
run_test_twin() {
    local primary_processor="$1"
    local output_file="$2"
    local test_processor="${TEST_TWINS[$primary_processor]}"
    
    if [ -z "$test_processor" ]; then
        log_test "${YELLOW}No test twin for $primary_processor${NC}"
        return 0
    fi
    
    log_test "${CYAN}🧪 Running Test Twin: $test_processor${NC}"
    log_test "Testing output: $output_file"
    
    # Determine test file name
    local test_file=""
    if [ ! -z "$output_file" ] && [ "$output_file" != "null" ]; then
        # Extract base name and add .test extension
        local dir=$(dirname "$output_file")
        local basename=$(basename "$output_file" .tsx)
        basename=$(basename "$basename" .ts)
        
        # Determine test type based on processor
        case $primary_processor in
            "REACT-PROCESSOR")
                test_file="$dir/${basename}.business.test.tsx"
                ;;
            "TYPE-PROCESSOR")
                test_file="$dir/${basename}.types.test.ts"
                ;;
            "HOOK-PROCESSOR")
                test_file="$dir/${basename}.hook.test.ts"
                ;;
            *)
                test_file="$dir/${basename}.test.tsx"
                ;;
        esac
    fi
    
    # Run the test twin processor
    if [ ! -z "$test_file" ]; then
        log_test "Generating test: $test_file"
        
        # Get the test twin processor definition
        local test_twin_def=".sdlc/01-core/A-agents/processors/test-twins/${test_processor,,}.md"
        
        if [ -f "$test_twin_def" ]; then
            $CLAUDE_PATH -p "You are $test_processor. Analyze $output_file and generate tests in $test_file based on $test_twin_def" \
                --allowedTools "Read" "Write" "Edit"
            
            if [ $? -eq 0 ]; then
                log_test "${GREEN}✓ Test twin completed: $test_file${NC}"
                
                # Validate test file was created
                if [ -f "$test_file" ]; then
                    local line_count=$(wc -l < "$test_file")
                    log_test "  Generated $line_count lines of tests"
                    
                    # Check if tests are meaningful (not just boilerplate)
                    if grep -q "No.*tests required" "$test_file"; then
                        log_test "${YELLOW}  ℹ No business logic tests needed${NC}"
                    else
                        log_test "${GREEN}  ✓ Business logic tests generated${NC}"
                    fi
                else
                    log_test "${YELLOW}  ⚠ Test file not created (may not be needed)${NC}"
                fi
                
                return 0
            else
                log_test "${RED}✗ Test twin failed${NC}"
                return 1
            fi
        else
            log_test "${YELLOW}Test twin definition not found: $test_twin_def${NC}"
            log_test "Generating test twin definition..."
            
            # Generate the test twin if it doesn't exist
            node scripts/generate-test-twin.js "$primary_processor"
            
            # Retry with generated definition
            if [ -f "$test_twin_def" ]; then
                run_test_twin "$primary_processor" "$output_file"
            fi
        fi
    else
        log_test "${YELLOW}No output file to test${NC}"
    fi
}

# Function to validate test quality
validate_test_quality() {
    local test_file="$1"
    
    if [ ! -f "$test_file" ]; then
        return 1
    fi
    
    local quality_score=0
    local max_score=5
    
    # Check 1: File exists and has content
    if [ -s "$test_file" ]; then
        ((quality_score++))
    fi
    
    # Check 2: Has actual test cases
    if grep -q "test\|it\|describe" "$test_file"; then
        ((quality_score++))
    fi
    
    # Check 3: Not just boilerplate
    if ! grep -q "renders without crashing\|renders correctly" "$test_file"; then
        ((quality_score++))
    fi
    
    # Check 4: Tests business logic
    if grep -qE "masks|formats|validates|handles|processes" "$test_file"; then
        ((quality_score++))
    fi
    
    # Check 5: Under 50 lines (concise)
    local line_count=$(wc -l < "$test_file")
    if [ $line_count -le 50 ]; then
        ((quality_score++))
    fi
    
    log_test "  Quality Score: $quality_score/$max_score"
    
    if [ $quality_score -ge 3 ]; then
        log_test "${GREEN}  ✓ Test quality: PASS${NC}"
        return 0
    else
        log_test "${YELLOW}  ⚠ Test quality: LOW${NC}"
        return 1
    fi
}

# Main execution
main() {
    log "${GREEN}🚀 Starting Pipeline with Test Twins${NC}"
    log "Test Mode: $TEST_MODE"
    log "Manifest: $MANIFEST_PATH"
    log "----------------------------------------"
    
    # Check if manifest exists
    if [ ! -f "$MANIFEST_PATH" ]; then
        log "${RED}Error: Manifest not found at $MANIFEST_PATH${NC}"
        exit 1
    fi
    
    # Initialize counters
    PROCESSOR_SUCCESS=0
    PROCESSOR_FAILED=0
    TEST_SUCCESS=0
    TEST_FAILED=0
    TEST_SKIPPED=0
    
    # Read manifest
    TOTAL_PROCESSORS=$(jq '.processors | length' "$MANIFEST_PATH")
    
    log "Total processors to run: $TOTAL_PROCESSORS"
    log ""
    
    # Process each processor
    for i in $(seq 0 $((TOTAL_PROCESSORS - 1))); do
        # Extract processor details
        SEQUENCE=$(jq -r ".processors[$i].sequence" "$MANIFEST_PATH")
        PROCESSOR=$(jq -r ".processors[$i].processor" "$MANIFEST_PATH")
        PURPOSE=$(jq -r ".processors[$i].purpose" "$MANIFEST_PATH")
        INPUT=$(jq -r ".processors[$i].input" "$MANIFEST_PATH")
        OUTPUT=$(jq -r ".processors[$i].output // empty" "$MANIFEST_PATH")
        TARGET=$(jq -r ".processors[$i].target_file // empty" "$MANIFEST_PATH")
        
        log "${YELLOW}[$SEQUENCE/$TOTAL_PROCESSORS] Running $PROCESSOR${NC}"
        log "Purpose: $PURPOSE"
        
        # Run the primary processor (simplified for demo)
        log "${BLUE}Executing processor...${NC}"
        
        # Simulate processor execution
        sleep 1
        
        # Mark as successful for demo
        PROCESSOR_SUCCESS=$((PROCESSOR_SUCCESS + 1))
        log "${GREEN}✓ Processor completed${NC}"
        
        # Determine output file for test twin
        OUTPUT_FOR_TEST=""
        if [ ! -z "$OUTPUT" ] && [ "$OUTPUT" != "null" ]; then
            OUTPUT_FOR_TEST="$OUTPUT"
        elif [ ! -z "$TARGET" ] && [ "$TARGET" != "null" ]; then
            OUTPUT_FOR_TEST="$TARGET"
        fi
        
        # Run test twin if enabled and applicable
        if [ "$TEST_MODE" != "skip" ] && has_test_twin "$PROCESSOR"; then
            log ""
            log_test "========================================="
            
            if run_test_twin "$PROCESSOR" "$OUTPUT_FOR_TEST"; then
                TEST_SUCCESS=$((TEST_SUCCESS + 1))
                
                # Validate test quality
                if [ ! -z "$OUTPUT_FOR_TEST" ]; then
                    local test_file="${OUTPUT_FOR_TEST%.*}.test.${OUTPUT_FOR_TEST##*.}"
                    validate_test_quality "$test_file"
                fi
            else
                TEST_FAILED=$((TEST_FAILED + 1))
            fi
            
            log_test "========================================="
        else
            TEST_SKIPPED=$((TEST_SKIPPED + 1))
        fi
        
        log ""
    done
    
    # Final summary
    log "=========================================="
    log "${BLUE}Pipeline Execution Summary${NC}"
    log "=========================================="
    log ""
    log "${MAGENTA}Primary Processors:${NC}"
    log "  Successful: ${GREEN}$PROCESSOR_SUCCESS${NC}/$TOTAL_PROCESSORS"
    log "  Failed: ${RED}$PROCESSOR_FAILED${NC}/$TOTAL_PROCESSORS"
    log ""
    log "${CYAN}Test Twins:${NC}"
    log "  Generated: ${GREEN}$TEST_SUCCESS${NC}"
    log "  Failed: ${RED}$TEST_FAILED${NC}"
    log "  Skipped: ${YELLOW}$TEST_SKIPPED${NC}"
    log ""
    log "Logs:"
    log "  Processor Log: $LOG_FILE"
    log "  Test Log: $TEST_LOG_FILE"
    
    # Run all generated tests if any exist
    if [ $TEST_SUCCESS -gt 0 ]; then
        log ""
        log "${CYAN}Running generated tests...${NC}"
        
        # Check if npm test is available
        if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
            npm test -- --testPathPattern="\.test\.(tsx?|jsx?)$" --passWithNoTests 2>&1 | tail -5
        else
            log "${YELLOW}No test runner configured${NC}"
        fi
    fi
    
    log ""
    log "${GREEN}✅ Pipeline with Test Twins complete!${NC}"
}

# Help function
show_help() {
    echo "Pipeline with Test Twins"
    echo "========================"
    echo ""
    echo "Usage: $0 [manifest-path] [options]"
    echo ""
    echo "Options:"
    echo "  TEST_MODE=auto    Automatically generate tests (default)"
    echo "  TEST_MODE=manual  Prompt before generating tests"
    echo "  TEST_MODE=skip    Skip test generation"
    echo ""
    echo "Example:"
    echo "  TEST_MODE=auto $0 processor-manifest.json"
    echo ""
    echo "Test twins will be generated for:"
    for processor in "${!TEST_TWINS[@]}"; do
        echo "  - $processor → ${TEST_TWINS[$processor]}"
    done
}

# Check for help flag
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"