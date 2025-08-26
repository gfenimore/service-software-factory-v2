#!/bin/bash

# Progressive Pipeline Runner
# Usage: ./run-pipeline.sh [concept|prototype|production] [feature-file]

LINE=${1:-prototype}
FEATURE=${2}

if [ -z "$FEATURE" ]; then
  echo "Usage: ./run-pipeline.sh [concept|prototype|production] [feature-file]"
  echo "Example: ./run-pipeline.sh concept features/US-006-feature.md"
  exit 1
fi

echo "🚀 Running Progressive Pipeline"
echo "================================"
echo "Line: $LINE"
echo "Feature: $FEATURE"
echo ""

# Set environment variable for line
export LINE=$LINE

# Validate line
if [[ ! "$LINE" =~ ^(concept|prototype|production)$ ]]; then
  echo "❌ Invalid line: $LINE"
  echo "Must be: concept, prototype, or production"
  exit 1
fi

# Check feature file exists
if [ ! -f "$FEATURE" ]; then
  echo "❌ Feature file not found: $FEATURE"
  exit 1
fi

# Copy feature to the appropriate line
cp "$FEATURE" ".pipeline/$LINE/features/"
echo "✅ Copied feature to .pipeline/$LINE/features/"

# Line-specific execution
case $LINE in
  concept)
    echo ""
    echo "🎨 CONCEPT LINE - Fast validation, loose standards"
    echo "=================================================="
    echo "- Mocks only"
    echo "- No TypeScript restrictions"
    echo "- Console logging allowed"
    echo ""
    echo "Available agents:"
    echo "- STORY-BUILDER (simplified stories)"
    echo "- PLANNER (coarse tasks)"
    echo "- PROCESSOR-SELECTOR (mock processors only)"
    ;;
    
  prototype)
    echo ""
    echo "🔧 PROTOTYPE LINE - Prove it works, medium standards"
    echo "===================================================="
    echo "- Real connections"
    echo "- TypeScript strict mode"
    echo "- 60% test coverage target"
    echo ""
    echo "Available agents:"
    echo "- STORY-BUILDER (technical stories)"
    echo "- PLANNER (medium granularity)"
    echo "- ARCHITECT (basic architecture)"
    echo "- PROCESSOR-SELECTOR (functional processors)"
    ;;
    
  production)
    echo ""
    echo "🏭 PRODUCTION LINE - Ship with confidence, strict standards"
    echo "=========================================================="
    echo "- Enterprise features"
    echo "- Full TypeScript safety"
    echo "- 80% test coverage requirement"
    echo ""
    echo "Available agents:"
    echo "- STORY-BUILDER (production-ready stories)"
    echo "- PLANNER (fine-grained tasks)"
    echo "- ARCHITECT (enterprise architecture)"
    echo "- PROCESSOR-SELECTOR (all processors)"
    ;;
esac

echo ""
echo "📋 Next steps:"
echo "1. Run @story-builder to create user story"
echo "2. Run @planner to decompose into tasks"
if [ "$LINE" != "concept" ]; then
  echo "3. Run @architect to design architecture"
fi
echo "4. Run @processor-selector to generate manifest"
echo "5. Execute processors based on manifest"

echo ""
echo "Pipeline artifacts will be in: .pipeline/$LINE/"