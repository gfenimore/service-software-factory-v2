#!/bin/bash
# ViewForge 2.0 Auto-Commit Script
# Runs every 30 minutes to preserve work

# Configuration
VF_DIR=".pipeline/01-factory-tools/viewforge"
LOG_FILE="$VF_DIR/auto-commit.log"
BRANCH="feature/viewforge-2.0"

# Function to create commit message
create_commit_message() {
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    local context=""
    
    # Read current context if available
    if [ -f "$VF_DIR/CURRENT-CONTEXT.md" ]; then
        context=$(head -n 1 "$VF_DIR/CURRENT-CONTEXT.md")
    fi
    
    echo "checkpoint(vf2): Auto-save at $timestamp"
    if [ ! -z "$context" ]; then
        echo ""
        echo "Context: $context"
    fi
}

# Function to perform commit
auto_commit() {
    echo "========================================" >> $LOG_FILE
    echo "Auto-commit started at $(date)" >> $LOG_FILE
    
    # Check if we're on the right branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "$BRANCH" ]; then
        echo "WARNING: Not on $BRANCH branch (currently on $current_branch)" >> $LOG_FILE
        echo "Switching to $BRANCH..." >> $LOG_FILE
        git checkout $BRANCH >> $LOG_FILE 2>&1
    fi
    
    # Check if there are changes
    if [ -z "$(git status --porcelain $VF_DIR)" ]; then
        echo "No changes to commit in ViewForge directory" >> $LOG_FILE
        return 0
    fi
    
    # Stage ViewForge changes
    git add $VF_DIR >> $LOG_FILE 2>&1
    
    # Create commit
    commit_msg=$(create_commit_message)
    git commit -m "$commit_msg" >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully committed changes" >> $LOG_FILE
        
        # Push to remote (optional - uncomment if desired)
        # git push origin $BRANCH >> $LOG_FILE 2>&1
        # echo "✅ Pushed to remote" >> $LOG_FILE
    else
        echo "❌ Commit failed" >> $LOG_FILE
    fi
    
    echo "Auto-commit completed at $(date)" >> $LOG_FILE
}

# Main execution
case "$1" in
    once)
        # Run once immediately
        auto_commit
        ;;
    watch)
        # Run continuously every 30 minutes
        echo "Starting auto-commit watcher (every 30 minutes)..."
        echo "Press Ctrl+C to stop"
        while true; do
            auto_commit
            sleep 1800  # 30 minutes
        done
        ;;
    *)
        echo "Usage: $0 {once|watch}"
        echo "  once  - Commit once immediately"
        echo "  watch - Commit every 30 minutes continuously"
        exit 1
        ;;
esac