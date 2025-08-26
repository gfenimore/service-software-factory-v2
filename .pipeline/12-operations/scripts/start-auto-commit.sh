#!/bin/bash
# Auto-start script for pipeline auto-commit
# Add this to your .bashrc or .bash_profile to run automatically

# Check if we're in the service-software-factory-v2 directory
if [[ "$PWD" == *"service-software-factory-v2"* ]]; then
    # Check if auto-commit is already running
    if ! pgrep -f "auto-commit.sh watch" > /dev/null; then
        echo "🚀 Starting Pipeline Auto-Commit Watcher..."
        nohup .pipeline/auto-commit.sh watch > /dev/null 2>&1 &
        echo "✅ Auto-commit watcher started (PID: $!)"
    else
        echo "✅ Auto-commit watcher already running"
    fi
fi