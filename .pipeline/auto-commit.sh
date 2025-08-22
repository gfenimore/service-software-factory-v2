#!/bin/bash
# Pipeline Auto-Commit Script
# Automatically commits pipeline changes to preserve work
# Updated for new reorganized structure

# Configuration
PIPELINE_DIR=".pipeline"
LOG_FILE="$PIPELINE_DIR/auto-commit.log"
BRANCH="feature/viewforge-2.0"
COMMIT_INTERVAL=900  # 15 minutes (in seconds)

# Function to detect what changed
detect_changes() {
    local changes=""
    
    # Check each major area
    if [ ! -z "$(git status --porcelain $PIPELINE_DIR/factory-tools/)" ]; then
        changes="${changes}tools "
    fi
    if [ ! -z "$(git status --porcelain $PIPELINE_DIR/configurations/)" ]; then
        changes="${changes}configs "
    fi
    if [ ! -z "$(git status --porcelain $PIPELINE_DIR/generated/)" ]; then
        changes="${changes}outputs "
    fi
    if [ ! -z "$(git status --porcelain $PIPELINE_DIR/documentation/)" ]; then
        changes="${changes}docs "
    fi
    if [ ! -z "$(git status --porcelain $PIPELINE_DIR/iterations/)" ]; then
        changes="${changes}iterations "
    fi
    
    echo "$changes"
}

# Function to create commit message
create_commit_message() {
    local timestamp=$(date +"%H:%M")
    local changes=$(detect_changes)
    local file_count=$(git status --porcelain $PIPELINE_DIR | wc -l)
    
    # Base message
    local msg="checkpoint(pipeline): Auto-save at $timestamp"
    
    # Add context about what changed
    if [ ! -z "$changes" ]; then
        msg="$msg - Updated: $changes"
    fi
    
    # Add file count
    msg="$msg ($file_count files)"
    
    echo "$msg"
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
    
    # Check if there are changes in pipeline
    if [ -z "$(git status --porcelain $PIPELINE_DIR)" ]; then
        echo "No changes to commit in pipeline directory" >> $LOG_FILE
        return 0
    fi
    
    # Stage pipeline changes
    git add $PIPELINE_DIR >> $LOG_FILE 2>&1
    
    # Also check for any other important files that might have changed
    if [ ! -z "$(git status --porcelain .claude/)" ]; then
        git add .claude/ >> $LOG_FILE 2>&1
        echo "Also staging .claude/ changes" >> $LOG_FILE
    fi
    
    # Create commit
    commit_msg=$(create_commit_message)
    git commit -m "$commit_msg" >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully committed: $commit_msg" >> $LOG_FILE
        
        # Optional: Push to remote (uncomment if desired)
        # git push origin $BRANCH >> $LOG_FILE 2>&1
        # echo "✅ Pushed to remote" >> $LOG_FILE
    else
        echo "❌ Commit failed" >> $LOG_FILE
    fi
    
    echo "Auto-commit completed at $(date)" >> $LOG_FILE
}

# Function to show status
show_status() {
    echo "📊 Pipeline Auto-Commit Status"
    echo "=============================="
    echo "Branch: $BRANCH"
    echo "Interval: Every $((COMMIT_INTERVAL / 60)) minutes"
    echo "Watching: $PIPELINE_DIR/"
    echo ""
    
    # Show recent commits
    echo "Recent auto-commits:"
    git log --oneline -5 --grep="checkpoint(pipeline)" 2>/dev/null || echo "No auto-commits yet"
    echo ""
    
    # Show current changes
    local changes=$(git status --porcelain $PIPELINE_DIR | wc -l)
    if [ $changes -gt 0 ]; then
        echo "⚠️  Uncommitted changes: $changes files"
        detect_changes
    else
        echo "✅ No uncommitted changes"
    fi
}

# Main execution
case "$1" in
    once)
        # Run once immediately
        auto_commit
        ;;
    watch)
        # Run continuously
        echo "🚀 Starting Pipeline Auto-Commit Watcher"
        echo "========================================="
        echo "Interval: Every $((COMMIT_INTERVAL / 60)) minutes"
        echo "Watching: $PIPELINE_DIR/"
        echo "Branch: $BRANCH"
        echo "Log: $LOG_FILE"
        echo ""
        echo "Press Ctrl+C to stop"
        echo ""
        
        # Initial commit if there are changes
        if [ ! -z "$(git status --porcelain $PIPELINE_DIR)" ]; then
            echo "📝 Making initial commit..."
            auto_commit
        fi
        
        # Watch loop
        while true; do
            sleep $COMMIT_INTERVAL
            auto_commit
        done
        ;;
    status)
        # Show current status
        show_status
        ;;
    *)
        echo "Pipeline Auto-Commit Script"
        echo "==========================="
        echo ""
        echo "Usage: $0 {once|watch|status}"
        echo ""
        echo "Commands:"
        echo "  once   - Commit once immediately"
        echo "  watch  - Commit every $((COMMIT_INTERVAL / 60)) minutes continuously"
        echo "  status - Show current status and recent commits"
        echo ""
        echo "This script monitors: $PIPELINE_DIR/"
        echo "Current branch: $(git branch --show-current)"
        exit 1
        ;;
esac