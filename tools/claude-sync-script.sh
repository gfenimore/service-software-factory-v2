#!/bin/bash
# claude-sync.sh - Bridge between Claude and GitHub

# Configuration
GITHUB_USER="gfenimore"
GITHUB_REPO="service-software-factory-v2"
GITHUB_BRANCH="feature/us-004-account-cards-column"
CLAUDE_ARTIFACTS_DIR="$HOME/claude-artifacts"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to pull file from GitHub to clipboard
pull_file() {
    local file_path=$1
    
    echo -e "${YELLOW}Fetching $file_path from GitHub...${NC}"
    
    # Construct raw GitHub URL
    local raw_url="https://raw.githubusercontent.com/$GITHUB_USER/$GITHUB_REPO/$GITHUB_BRANCH/$file_path"
    
    # Fetch the file
    local content=$(curl -s "$raw_url")
    
    if [ -z "$content" ]; then
        echo -e "${RED}Error: Could not fetch file. Check path and branch.${NC}"
        return 1
    fi
    
    # Format for Claude with proper markdown
    local formatted_content="## File: $file_path

\`\`\`markdown
$content
\`\`\`

Please review this file from my GitHub repository."
    
    # Copy to clipboard (Windows Git Bash)
    echo "$formatted_content" | clip.exe
    
    echo -e "${GREEN}✓ File copied to clipboard!${NC}"
    echo -e "Now paste into Claude with Ctrl+V"
}

# Function to extract artifact from Claude and save
push_artifact() {
    local artifact_name=$1
    local target_path=$2
    
    echo -e "${YELLOW}Waiting for artifact content...${NC}"
    echo "1. Copy the artifact content from Claude"
    echo "2. Press Enter when ready"
    read
    
    # Create directory if needed
    mkdir -p "$(dirname "$target_path")"
    
    # Get content from clipboard
    local content=$(powershell.exe -command "Get-Clipboard" | tr -d '\r')
    
    # Save to file
    echo "$content" > "$target_path"
    
    echo -e "${GREEN}✓ Saved to $target_path${NC}"
    
    # Ask about git operations
    read -p "Commit and push to GitHub? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add "$target_path"
        git commit -m "feat: add $artifact_name via claude-sync"
        git push origin "$GITHUB_BRANCH"
        echo -e "${GREEN}✓ Pushed to GitHub!${NC}"
    fi
}

# Function to list recent artifacts
list_artifacts() {
    echo -e "${YELLOW}Recent artifacts in this chat:${NC}"
    echo "1. processor-selector-v2.md"
    echo "2. claude-sync-script.sh"
    echo "3. automation-architecture-diagram.mmd"
    # In reality, this would scan the chat or maintain a list
}

# Function to sync entire folder
sync_folder() {
    local folder_path=$1
    
    echo -e "${YELLOW}Syncing folder: $folder_path${NC}"
    
    # Get list of files from GitHub API
    local api_url="https://api.github.com/repos/$GITHUB_USER/$GITHUB_REPO/contents/$folder_path?ref=$GITHUB_BRANCH"
    local files=$(curl -s "$api_url" | jq -r '.[] | select(.type=="file") | .path')
    
    echo "Found files:"
    echo "$files"
    
    # For each file, create a batch clipboard content
    # This is where we'd aggregate multiple files
}

# Main command handler
case "$1" in
    "pull")
        pull_file "$2"
        ;;
    "push")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: ./claude-sync push <artifact-name> <target-path>"
            exit 1
        fi
        push_artifact "$2" "$3"
        ;;
    "list")
        list_artifacts
        ;;
    "sync")
        sync_folder "$2"
        ;;
    *)
        echo "Claude-Sync Bridge v1.0"
        echo ""
        echo "Usage:"
        echo "  ./claude-sync pull <file-path>     - Fetch file from GitHub to clipboard"
        echo "  ./claude-sync push <name> <path>   - Save artifact to file and push"
        echo "  ./claude-sync list                 - List recent artifacts"
        echo "  ./claude-sync sync <folder>        - Sync entire folder"
        echo ""
        echo "Examples:"
        echo "  ./claude-sync pull .sdlc/01-core/A-agents/processors/type-processor.md"
        echo "  ./claude-sync push processor-v3.md .sdlc/01-core/A-agents/processors/"
        ;;
esac