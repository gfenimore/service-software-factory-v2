#!/bin/bash
# test-validation-tools.sh
# Quick test script to demonstrate the validation tools

echo "🧪 Testing Processor Validation Tools"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Pre-validation
echo -e "${BLUE}Test 1: Pre-Validation Check${NC}"
echo "Running pre-validation on current manifest..."
echo ""

if [ -f "scripts/pre-validate-manifest.js" ]; then
    node scripts/pre-validate-manifest.js
    PRE_RESULT=$?
    echo ""
    
    if [ $PRE_RESULT -eq 0 ]; then
        echo -e "${GREEN}✓ Pre-validation passed${NC}"
    else
        echo -e "${YELLOW}⚠ Pre-validation found issues${NC}"
    fi
else
    echo "Pre-validation script not found"
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Post-validation
echo -e "${BLUE}Test 2: Post-Validation Check${NC}"
echo "Checking actual vs expected outputs..."
echo ""

if [ -f "scripts/validate-processor-output.js" ]; then
    node scripts/validate-processor-output.js
    POST_RESULT=$?
    echo ""
    
    if [ $POST_RESULT -eq 0 ]; then
        echo -e "${GREEN}✓ All expected files exist${NC}"
    else
        echo -e "${YELLOW}⚠ Some expected files are missing${NC}"
    fi
else
    echo "Post-validation script not found"
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Show current state
echo -e "${BLUE}Test 3: Current File State${NC}"
echo "Checking what actually exists..."
echo ""

echo "Type files:"
ls -la src/types/*.types.ts 2>/dev/null || echo "  No type files found"

echo ""
echo "Hook files:"
ls -la src/hooks/use*.ts 2>/dev/null || echo "  No hook files found"

echo ""
echo "Account components:"
ls -la src/components/accounts/*.tsx 2>/dev/null || echo "  No account components found"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Validation tools test complete${NC}"
echo ""
echo "Next steps:"
echo "1. Fix any issues identified by pre-validation"
echo "2. Run the enhanced pipeline: ./scripts/run-processor-pipeline-validated.sh"
echo "3. Check post-validation to ensure all files were created"