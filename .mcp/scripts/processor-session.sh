#!/bin/bash
# processor-session.sh - Manage processor sessions via MCP

# Full path to claude (confirmed working)
CLAUDE="/c/Users/GarryFenimore/AppData/Roaming/npm/claude"

# Function to update session progress
update_progress() {
    local session_id=$1
    local new_processor=$2
    local completed=$3
    
    echo "Ì≥ù Updating session $session_id to $new_processor ($completed completed)..."
    
    "$CLAUDE" << EOF
Update processor_sessions in Supabase where id = '$session_id' set:
- current_processor = '$new_processor'
- processors_completed = $completed
- status = 'running'

Confirm the update was successful.
EOF
}

# Main script logic
case ${1:-help} in
    update)
        update_progress "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: processor-session.sh update <session_id> <new_processor> <completed_count>"
        ;;
esac
