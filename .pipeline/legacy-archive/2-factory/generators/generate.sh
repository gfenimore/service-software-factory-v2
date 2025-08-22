#!/bin/bash

# ViewForge HTML Generator Script
# Usage: ./generate.sh [config-file]

echo "🎨 ViewForge HTML Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Default to latest config if not specified
if [ -z "$1" ]; then
    CONFIG=$(ls -t ../ui-config/configurations/*.json 2>/dev/null | head -1)
    if [ -z "$CONFIG" ]; then
        echo "❌ No configuration files found"
        echo "   Create one using ViewForge configurator first"
        exit 1
    fi
    echo "📁 Using latest config: $(basename $CONFIG)"
else
    CONFIG="$1"
fi

# Generate HTML
node simple-html-generator.js "$CONFIG"

# Show result
if [ $? -eq 0 ]; then
    OUTPUT=$(ls -t ../../../3-workspace/concept/*.html 2>/dev/null | head -1)
    echo ""
    echo "🎉 Success! Open your generated HTML:"
    echo "   $OUTPUT"
    echo ""
    echo "💡 Tip: Open in browser with:"
    echo "   start $OUTPUT"
fi