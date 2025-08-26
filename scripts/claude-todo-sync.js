#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { TodoBoard } = require('./terminal-todo-board')

const CLAUDE_TODO_FILE = path.join(process.cwd(), '.claude-todos.json')
const SYNC_LOG_FILE = path.join(process.cwd(), '.todo-sync.log')

class ClaudeTodoSync {
  constructor() {
    this.board = new TodoBoard()
  }

  syncFromClaude(claudeTodos) {
    const timestamp = new Date().toISOString()
    let synced = 0
    let updated = 0

    claudeTodos.forEach((claudeTodo) => {
      const existingTodo = this.board.todos.find(
        (t) => t.claudeId === claudeTodo.id || t.content === claudeTodo.content
      )

      if (existingTodo) {
        if (existingTodo.status !== claudeTodo.status) {
          existingTodo.status = claudeTodo.status

          if (claudeTodo.status === 'in_progress' && !existingTodo.startTime) {
            existingTodo.startTime = Date.now()
          } else if (claudeTodo.status === 'completed' && !existingTodo.completionTime) {
            existingTodo.completionTime = existingTodo.startTime
              ? Date.now() - existingTodo.startTime
              : 0
            existingTodo.completedAt = Date.now()
            this.board.updateAnalytics(existingTodo)
          }

          updated++
        }
      } else {
        const newTodo = {
          id: Date.now().toString(),
          claudeId: claudeTodo.id,
          content: claudeTodo.content,
          status: claudeTodo.status,
          createdAt: Date.now(),
          startTime: claudeTodo.status === 'in_progress' ? Date.now() : null,
          completionTime: null,
        }

        this.board.todos.push(newTodo)
        this.board.analytics.totalTasks++
        synced++
      }
    })

    this.board.saveTodos()
    this.board.saveAnalytics()

    const logEntry = {
      timestamp,
      action: 'sync_from_claude',
      synced,
      updated,
      totalTodos: this.board.todos.length,
    }

    this.logSync(logEntry)

    console.log(`✅ Synced ${synced} new todos, updated ${updated} existing todos`)
    return { synced, updated }
  }

  exportForClaude() {
    const claudeFormat = this.board.todos.map((todo) => ({
      id: todo.claudeId || todo.id,
      content: todo.content,
      status: todo.status,
    }))

    fs.writeFileSync(CLAUDE_TODO_FILE, JSON.stringify(claudeFormat, null, 2))

    console.log(`📤 Exported ${claudeFormat.length} todos for Claude`)
    return claudeFormat
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.board.todos.length,
        pending: this.board.todos.filter((t) => t.status === 'pending').length,
        inProgress: this.board.todos.filter((t) => t.status === 'in_progress').length,
        completed: this.board.todos.filter((t) => t.status === 'completed').length,
      },
      analytics: this.board.analytics,
      currentTasks: this.board.todos
        .filter((t) => t.status === 'in_progress')
        .map((t) => ({
          content: t.content,
          duration: t.startTime ? Date.now() - t.startTime : 0,
        })),
      recentCompleted: this.board.todos
        .filter((t) => t.status === 'completed')
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
        .slice(0, 5)
        .map((t) => ({
          content: t.content,
          completionTime: t.completionTime,
        })),
    }

    return report
  }

  logSync(entry) {
    let log = []
    try {
      if (fs.existsSync(SYNC_LOG_FILE)) {
        log = JSON.parse(fs.readFileSync(SYNC_LOG_FILE, 'utf8'))
      }
    } catch (error) {
      console.error('Error loading sync log:', error.message)
    }

    log.push(entry)

    if (log.length > 100) {
      log = log.slice(-100)
    }

    fs.writeFileSync(SYNC_LOG_FILE, JSON.stringify(log, null, 2))
  }

  watchForClaudeUpdates() {
    console.log('👀 Watching for Claude todo updates...')

    if (fs.existsSync(CLAUDE_TODO_FILE)) {
      fs.watchFile(CLAUDE_TODO_FILE, { interval: 2000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          try {
            const claudeTodos = JSON.parse(fs.readFileSync(CLAUDE_TODO_FILE, 'utf8'))
            this.syncFromClaude(claudeTodos)
            console.log('📥 Synced updates from Claude')
          } catch (error) {
            console.error('Error syncing from Claude:', error.message)
          }
        }
      })
    }

    process.on('SIGINT', () => {
      console.log('\n👋 Stopping Claude sync...')
      process.exit(0)
    })
  }
}

function main() {
  const sync = new ClaudeTodoSync()
  const [, , command, ...args] = process.argv

  switch (command) {
    case 'sync':
      if (fs.existsSync(CLAUDE_TODO_FILE)) {
        const claudeTodos = JSON.parse(fs.readFileSync(CLAUDE_TODO_FILE, 'utf8'))
        sync.syncFromClaude(claudeTodos)
      } else {
        console.log('No Claude todos file found')
      }
      break

    case 'export':
      sync.exportForClaude()
      break

    case 'report':
      const report = sync.generateReport()
      console.log(JSON.stringify(report, null, 2))
      break

    case 'watch':
      sync.watchForClaudeUpdates()
      break

    default:
      console.log(`
Claude Todo Sync - Synchronize todos with Claude

USAGE:
  node scripts/claude-todo-sync.js [command]

COMMANDS:
  sync      Sync todos from Claude
  export    Export todos for Claude
  report    Generate analytics report
  watch     Watch for Claude updates
`)
  }
}

if (require.main === module) {
  main()
}

module.exports = { ClaudeTodoSync }
