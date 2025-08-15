# Terminal Todo Board with Analytics

A powerful command-line task management system with real-time analytics, designed to track and analyze development workflow patterns.

## Features

- **Visual Todo Board**: Color-coded terminal display with pending, in-progress, and completed tasks
- **Real-time Analytics**: Track completion rates, average times, and productivity patterns
- **Watch Mode**: Live updates as tasks change
- **Claude Integration**: Sync with Claude's internal todo system
- **Persistence**: Tasks and analytics saved between sessions
- **Time Tracking**: Automatic duration tracking for tasks

## Quick Start

```bash
# Display help
npm run todo

# Watch mode (real-time updates)
npm run todo:watch

# Add a new task
npm run todo:add "Implement new feature"

# Start a task
node scripts/terminal-todo-board.js start <task-id>

# Complete a task
node scripts/terminal-todo-board.js complete <task-id>

# View current board
node scripts/terminal-todo-board.js list

# Generate analytics report
npm run todo:report
```

## Commands

### Core Commands

| Command           | Description                          | Example                                                   |
| ----------------- | ------------------------------------ | --------------------------------------------------------- |
| `watch`           | Display board with real-time updates | `npm run todo:watch`                                      |
| `add <content>`   | Add a new todo                       | `npm run todo:add "Fix bug #123"`                         |
| `start <id>`      | Start working on a todo              | `node scripts/terminal-todo-board.js start 1234567890`    |
| `complete <id>`   | Mark todo as completed               | `node scripts/terminal-todo-board.js complete 1234567890` |
| `remove <id>`     | Remove a todo                        | `node scripts/terminal-todo-board.js remove 1234567890`   |
| `clear-completed` | Remove all completed todos           | `node scripts/terminal-todo-board.js clear-completed`     |
| `list`            | Display current board                | `node scripts/terminal-todo-board.js list`                |
| `analytics`       | Show detailed analytics              | `node scripts/terminal-todo-board.js analytics`           |

### Claude Sync Commands

| Command  | Description               | Example                                   |
| -------- | ------------------------- | ----------------------------------------- |
| `sync`   | Sync todos from Claude    | `npm run todo:sync`                       |
| `export` | Export todos for Claude   | `node scripts/claude-todo-sync.js export` |
| `report` | Generate analytics report | `npm run todo:report`                     |
| `watch`  | Watch for Claude updates  | `node scripts/claude-todo-sync.js watch`  |

## Analytics Features

The board tracks and displays:

- **Completion Rate**: Percentage of completed tasks
- **Average Completion Time**: Mean time to complete tasks
- **Most Productive Hour**: Hour of day with most completions
- **Task Duration Extremes**: Longest and shortest tasks
- **Time-based Patterns**: Tasks by day and hour

## File Structure

```
.todo-board.json        # Current todos
.todo-analytics.json    # Analytics data
.claude-todos.json      # Claude sync file
.todo-sync.log         # Sync history
```

## Watch Mode

In watch mode, the board automatically refreshes:

- When the todo file changes
- Every 5 seconds if tasks are in progress
- Shows live duration for active tasks

Press `Ctrl+C` to exit watch mode.

## Color Coding

- 🟡 **Yellow**: Pending tasks
- 🔵 **Blue**: In-progress tasks
- 🟢 **Green**: Completed tasks
- 🟣 **Magenta**: Analytics section
- ⚫ **Dim**: Metadata and timestamps

## Integration with Development Workflow

### US-007 Implementation Tracking

Use the board to track implementation of user stories:

```bash
# Add US-007 tasks
npm run todo:add "Review US-007 requirements"
npm run todo:add "Implement handoff template"
npm run todo:add "Create validation rules"
npm run todo:add "Write tests"
npm run todo:add "Update documentation"

# Start tracking in another terminal
npm run todo:watch
```

### Sprint Planning

Track sprint tasks with analytics:

```bash
# At sprint start
npm run todo:add "Sprint 23 - Feature A"
npm run todo:add "Sprint 23 - Bug fixes"
npm run todo:add "Sprint 23 - Tech debt"

# During sprint
npm run todo:watch  # Monitor progress

# Sprint review
npm run todo:report  # Generate analytics
```

## Best Practices

1. **Start tasks before working**: Use `start` command to track time accurately
2. **Complete immediately**: Mark tasks complete as soon as finished
3. **Use descriptive names**: Include ticket numbers and context
4. **Regular cleanup**: Use `clear-completed` to maintain focus
5. **Monitor patterns**: Check analytics weekly for insights

## Keyboard Shortcuts

In watch mode:

- `Ctrl+C`: Exit watch mode

## Technical Details

- **Node.js**: Pure Node.js implementation, no external dependencies
- **File Watching**: Uses `fs.watchFile` for real-time updates
- **ANSI Colors**: Terminal colors using ANSI escape codes
- **JSON Storage**: Simple JSON files for persistence
- **Modular Design**: Exportable classes for integration

## Value for US-007 and Beyond

This tool provides:

1. **Visibility**: Real-time view of current work
2. **Accountability**: Time tracking for tasks
3. **Analytics**: Data-driven insights into productivity
4. **Integration**: Works with Claude's task system
5. **Simplicity**: No dependencies, runs anywhere

Perfect for tracking complex implementations like US-007 while gathering data to improve future estimates and workflows.
