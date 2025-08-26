# Programmatic Claude automation through CLI and Cursor IDE

This comprehensive guide details how to programmatically invoke Claude through automation, covering both command-line interface approaches and Cursor IDE integration, with practical examples and working code.

## Claude CLI gives you terminal-based automation

The most powerful approach for command-line automation is **Claude Code**, Anthropic's official agentic terminal tool that enables sophisticated automation workflows. Claude Code acts as an autonomous agent capable of editing files, running commands, and managing entire development workflows directly from your terminal.

### Installing and configuring Claude Code

Setting up Claude Code requires Node.js 18+ and works on macOS, Linux, and Windows (via WSL). Installation is straightforward through npm:

```bash
# Install globally via npm
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

Authentication offers three distinct methods, each suited for different automation scenarios. The **OAuth flow** provides the simplest setup for interactive use - running `claude` initiates browser-based authentication linked to your Anthropic Console account. For **automated workflows**, the API key helper method proves more practical:

```bash
# Create API key helper script
echo 'echo ${ANTHROPIC_API_KEY}' > ~/.claude/anthropic_key_helper.sh
chmod +x ~/.claude/anthropic_key_helper.sh

# Set environment variable in your shell profile
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

The configuration lives in two locations. Global settings reside in `~/.claude.json`, controlling theme, key bindings, and onboarding status. Project-specific settings in `~/.claude/settings.json` define allowed tools, directories, and MCP servers for each workspace:

```json
{
  "projects": {
    "/path/to/project": {
      "allowedTools": ["Task", "Bash", "Read", "Edit", "Write"],
      "disallowedTools": [],
      "mcpServers": {}
    }
  }
}
```

### Command syntax and bash integration

Claude Code offers flexible command patterns for different automation needs. The interactive mode launches with simply `claude`, while single queries with automatic exit use the `-p` flag. Piping content works seamlessly for processing existing data:

```bash
# Single query with JSON output for parsing
claude -p "analyze this function" --output-format json

# Process piped content
cat error.log | claude -p "identify the root cause"

# Continue previous conversation
claude -c

# Specify model and constraints
claude --model sonnet --max-turns 3 -p "optimize this algorithm"
```

**Bash script integration** becomes powerful when combining Claude Code with existing workflows. Here's a practical example for automated code review:

```bash
#!/bin/bash
# Automated PR review script
DIFF=$(git diff main...feature-branch)
REVIEW=$(claude -p "Review this diff for bugs and security issues: $DIFF" \
  --output-format json \
  --allowedTools "Read" "Bash(git:*)")

# Parse JSON response and create GitHub comment
echo "$REVIEW" | jq -r '.result' | gh pr comment --body-file -
```

For continuous integration, headless mode enables fully automated workflows without permission prompts:

```bash
# CI/CD pipeline integration
claude -p "If tests fail, analyze logs and suggest fixes" \
  --dangerously-skip-permissions \
  --allowedTools "Bash(npm test)" "Read" "Edit"
```

The tool permission system provides granular control over what Claude can execute. Rather than allowing all tools, specify exact permissions for security:

```bash
# Safe automation with specific permissions
claude --allowedTools "Read" "Bash(git log:*)" "Edit(*.md)" \
  --disallowedTools "Bash(rm:*)" "Write(*.env)"
```

### Alternative CLI approaches

While Claude Code provides the most sophisticated capabilities, simpler alternatives exist for basic API access. Python users can leverage third-party wrappers or create custom scripts using the official SDK:

```python
#!/usr/bin/env python3
import os
import sys
from anthropic import Anthropic

def claude_cli(prompt):
    client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    
    for event in response:
        if hasattr(event.delta, 'text'):
            print(event.delta.text, end='', flush=True)

if __name__ == '__main__':
    claude_cli(' '.join(sys.argv[1:]))
```

Direct API calls via curl provide maximum portability without dependencies:

```bash
#!/bin/bash
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-sonnet-4-20250514\",
    \"max_tokens\": 1024,
    \"messages\": [{\"role\": \"user\", \"content\": \"$1\"}]
  }" | jq -r '.content[0].text'
```

## Cursor IDE enables multiple integration pathways

Cursor's architecture as a VSCode fork with native Claude support creates several powerful integration options, each offering different levels of control and automation capabilities.

### Claude Code integration with Cursor

The most robust Cursor integration leverages Claude Code CLI directly. Installation from within Cursor's integrated terminal establishes bidirectional communication:

```bash
# From Cursor's integrated terminal
claude /ide

# Alternative: Install as extension
cursor --install-extension ~/.claude/local/node_modules/@anthropic-ai/claude-code/vendor/claude-code.vsix
```

This integration provides seamless workflow enhancements. **Quick launch** via `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux) opens Claude directly from Cursor. Code changes appear in Cursor's diff viewer, maintaining full version control awareness. Current selections automatically share context with Claude, while `Cmd+Option+K` inserts file references instantly.

For automation, background commands eliminate interactive prompts:

```yaml
# claude-automation.yml
direct_prompt: |
  Review all TypeScript files for type safety issues.
  Fix any problems found and create a summary report.
```

### Continue.dev provides extensible automation

Continue.dev offers an open-source alternative with extensive customization options. Configuration through YAML enables precise Claude integration:

```yaml
name: ClaudeAutomation
version: 1.0.0

models:
  - name: Claude-3.5-Sonnet
    provider: anthropic
    model: claude-3-5-sonnet-20241022
    apiKey: ${ANTHROPIC_API_KEY}
    defaultCompletionOptions:
      temperature: 0.2
      maxTokens: 4000
      thinking:
        type: enabled
        budget_tokens: 16000

context:
  - provider: codebase
  - provider: diff
  - provider: terminal

mcpServers:
  - name: GitAutomation
    command: node
    args: ["./scripts/git-automation.js"]
```

Continue's **agent mode** enables autonomous multi-step task execution. Background tasks run without user intervention, while MCP (Model Context Protocol) tools integrate external services. Custom rules enforce project-specific coding standards automatically.

### Custom VSCode extension development

For maximum control, custom extensions leverage VSCode's Language Model API directly. This TypeScript example demonstrates programmatic Claude invocation:

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'claude-automation.analyze',
        async () => {
            const models = await vscode.lm.selectChatModels({
                vendor: 'anthropic',
                family: 'claude-3-5-sonnet'
            });
            
            if (models.length > 0) {
                const editor = vscode.window.activeTextEditor;
                const code = editor?.document.getText() || '';
                
                const messages = [
                    vscode.LanguageModelChatMessage.User(
                        `Analyze this code for improvements: ${code}`
                    )
                ];
                
                const response = await models[0].sendRequest(messages);
                
                // Process and display results
                let result = '';
                for await (const fragment of response.text) {
                    result += fragment;
                }
                
                vscode.window.showInformationMessage(result);
            }
        }
    );
    
    context.subscriptions.push(disposable);
}
```

The extension manifest configures commands and keybindings:

```json
{
    "name": "claude-automation",
    "contributes": {
        "commands": [{
            "command": "claude-automation.analyze",
            "title": "Claude: Analyze Code"
        }],
        "keybindings": [{
            "command": "claude-automation.analyze",
            "key": "ctrl+alt+c",
            "when": "editorTextFocus"
        }]
    }
}
```

### Practical automation workflows

**Automated code review** combines Claude's analysis with version control:

```typescript
async function automateCodeReview() {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    const git = gitExtension?.exports.getAPI(1);
    const changes = await git.repositories[0].diff();
    
    const models = await vscode.lm.selectChatModels({
        vendor: 'anthropic'
    });
    
    const review = await models[0].sendRequest([
        vscode.LanguageModelChatMessage.User(
            `Review these changes for bugs and improvements:\n${changes}`
        )
    ]);
    
    // Create review comments in source control panel
    createReviewComments(review);
}
```

**Batch processing** handles multiple files efficiently:

```bash
#!/bin/bash
# Process all TypeScript files in parallel
find src -name "*.ts" | parallel -j4 \
  "claude --file {} -p 'Add comprehensive JSDoc comments'"
```

**Test generation** automates comprehensive test coverage:

```yaml
# Continue.dev agent configuration
agents:
  - name: TestGenerator
    model: claude-3-5-sonnet
    workflow:
      - analyze-code-structure
      - identify-test-scenarios
      - generate-test-cases
      - validate-coverage
```

## Authentication and security considerations

Proper authentication setup underpins all automation approaches. API keys from the Anthropic Console follow the format `sk-ant-api03-...` and should **never appear in code**. Environment variables provide the standard solution:

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="your-key-here"

# For project-specific keys
echo 'ANTHROPIC_API_KEY="your-key"' > .env
echo '.env' >> .gitignore
```

Security best practices for production environments include **key rotation** through the Anthropic Console, **workspace scoping** to limit access, and **rate limit handling** in automation scripts:

```python
from anthropic import RateLimitError
import time

def safe_claude_call(client, messages):
    try:
        return client.messages.create(
            model="claude-sonnet-4-20250514",
            messages=messages
        )
    except RateLimitError as e:
        retry_after = int(e.response.headers.get('retry-after', 60))
        time.sleep(retry_after)
        return safe_claude_call(client, messages)
```

## Key limitations and requirements

**Network connectivity** remains mandatory - all Claude processing happens on Anthropic servers with no offline mode available. **Geographic restrictions** apply, with service available only in Anthropic's supported countries. **Cost considerations** follow token-based pricing: Claude Sonnet 4 costs $3 per million input tokens and $15 per million output tokens, though batch processing offers 50% discounts and prompt caching reduces costs by 90% for repeated content.

Rate limits scale automatically with usage tiers, starting from basic limits and increasing based on consumption patterns. Enterprise agreements provide custom limits. The token bucket algorithm ensures smooth operation under sustained load.

Platform compatibility varies by tool. Claude Code fully supports macOS and Linux, requiring WSL for Windows operation. Cursor runs natively on all platforms, while custom scripts work anywhere with appropriate language runtimes.

## Conclusion

Programmatic Claude invocation offers powerful automation capabilities through multiple complementary approaches. **Claude Code CLI** provides the most sophisticated terminal-based automation with agentic capabilities, file editing, and command execution. For teams already using **Cursor IDE**, native integration combined with Continue.dev or custom extensions enables seamless workflow automation. The official **Anthropic SDKs** offer maximum flexibility for custom implementations.

The choice between approaches depends on specific requirements. Development teams benefit most from Claude Code's deep codebase integration and autonomous capabilities. Simple automation tasks work well with lightweight API wrappers or direct SDK usage. IDE-centric workflows leverage Cursor's native Claude support enhanced by Continue.dev's customization options.

Success with Claude automation requires careful attention to authentication security, appropriate tool permissions, and cost management through features like prompt caching and batch processing. The ecosystem continues evolving rapidly, with Claude 4's enhanced capabilities and the extensible Claude Code SDK opening new automation possibilities for modern development workflows.