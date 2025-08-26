#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { execSync } = require('child_process')

const TODO_FILE = path.join(process.cwd(), '.todo-board.json')
const ANALYTICS_FILE = path.join(process.cwd(), '.todo-analytics.json')

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

class TodoBoard {
  constructor() {
    this.todos = this.loadTodos()
    this.analytics = this.loadAnalytics()
    this.startTime = Date.now()
  }

  loadTodos() {
    try {
      if (fs.existsSync(TODO_FILE)) {
        return JSON.parse(fs.readFileSync(TODO_FILE, 'utf8'))
      }
    } catch (error) {
      console.error('Error loading todos:', error.message)
    }
    return []
  }

  saveTodos() {
    fs.writeFileSync(TODO_FILE, JSON.stringify(this.todos, null, 2))
  }

  loadAnalytics() {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'))
      }
    } catch (error) {
      console.error('Error loading analytics:', error.message)
    }
    return {
      totalTasks: 0,
      completedTasks: 0,
      averageCompletionTime: 0,
      tasksByDay: {},
      tasksByHour: {},
      patterns: {
        mostProductiveDay: null,
        mostProductiveHour: null,
        longestTask: null,
        shortestTask: null,
      },
    }
  }

  saveAnalytics() {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.analytics, null, 2))
  }

  clearScreen() {
    console.clear()
  }

  displayBoard() {
    this.clearScreen()

    console.log(
      `${COLORS.bright}${COLORS.cyan}╔═══════════════════════════════════════════════════════════════════════════╗${COLORS.reset}`
    )
    console.log(
      `${COLORS.bright}${COLORS.cyan}║                         TERMINAL TODO BOARD v1.0                         ║${COLORS.reset}`
    )
    console.log(
      `${COLORS.bright}${COLORS.cyan}╚═══════════════════════════════════════════════════════════════════════════╝${COLORS.reset}\n`
    )

    const pending = this.todos.filter((t) => t.status === 'pending')
    const inProgress = this.todos.filter((t) => t.status === 'in_progress')
    const completed = this.todos.filter((t) => t.status === 'completed')

    console.log(`${COLORS.bright}📊 OVERVIEW${COLORS.reset}`)
    console.log(`├─ Total: ${this.todos.length}`)
    console.log(`├─ ${COLORS.yellow}⏳ Pending: ${pending.length}${COLORS.reset}`)
    console.log(`├─ ${COLORS.blue}🔄 In Progress: ${inProgress.length}${COLORS.reset}`)
    console.log(`└─ ${COLORS.green}✅ Completed: ${completed.length}${COLORS.reset}\n`)

    console.log(`${COLORS.bright}${COLORS.yellow}📋 PENDING${COLORS.reset}`)
    if (pending.length === 0) {
      console.log(`${COLORS.dim}   No pending tasks${COLORS.reset}`)
    } else {
      pending.forEach((todo, index) => {
        const symbol = index === pending.length - 1 ? '└─' : '├─'
        console.log(`${symbol} [${todo.id}] ${todo.content}`)
      })
    }
    console.log()

    console.log(`${COLORS.bright}${COLORS.blue}🔄 IN PROGRESS${COLORS.reset}`)
    if (inProgress.length === 0) {
      console.log(`${COLORS.dim}   No tasks in progress${COLORS.reset}`)
    } else {
      inProgress.forEach((todo, index) => {
        const symbol = index === inProgress.length - 1 ? '└─' : '├─'
        const duration = todo.startTime ? this.formatDuration(Date.now() - todo.startTime) : ''
        console.log(
          `${symbol} [${todo.id}] ${todo.content} ${COLORS.dim}(${duration})${COLORS.reset}`
        )
      })
    }
    console.log()

    console.log(`${COLORS.bright}${COLORS.green}✅ COMPLETED${COLORS.reset}`)
    if (completed.length === 0) {
      console.log(`${COLORS.dim}   No completed tasks${COLORS.reset}`)
    } else {
      completed.slice(-5).forEach((todo, index) => {
        const symbol = index === Math.min(completed.length, 5) - 1 ? '└─' : '├─'
        const duration = todo.completionTime ? this.formatDuration(todo.completionTime) : ''
        console.log(
          `${symbol} [${todo.id}] ${COLORS.dim}${todo.content} (${duration})${COLORS.reset}`
        )
      })
      if (completed.length > 5) {
        console.log(`   ${COLORS.dim}... and ${completed.length - 5} more${COLORS.reset}`)
      }
    }
    console.log()

    this.displayAnalytics()
  }

  displayAnalytics() {
    const completionRate =
      this.analytics.totalTasks > 0
        ? ((this.analytics.completedTasks / this.analytics.totalTasks) * 100).toFixed(1)
        : 0

    console.log(`${COLORS.bright}${COLORS.magenta}📈 ANALYTICS${COLORS.reset}`)
    console.log(`├─ Completion Rate: ${completionRate}%`)
    console.log(`├─ Total Tasks: ${this.analytics.totalTasks}`)
    console.log(
      `├─ Avg Completion Time: ${this.formatDuration(this.analytics.averageCompletionTime)}`
    )

    if (this.analytics.patterns.mostProductiveHour) {
      console.log(`├─ Most Productive Hour: ${this.analytics.patterns.mostProductiveHour}:00`)
    }

    if (this.analytics.patterns.longestTask) {
      console.log(
        `├─ Longest Task: ${this.analytics.patterns.longestTask.content} (${this.formatDuration(this.analytics.patterns.longestTask.time)})`
      )
    }

    if (this.analytics.patterns.shortestTask) {
      console.log(
        `└─ Shortest Task: ${this.analytics.patterns.shortestTask.content} (${this.formatDuration(this.analytics.patterns.shortestTask.time)})`
      )
    }
    console.log()
  }

  formatDuration(ms) {
    if (!ms || ms < 0) return '0s'

    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  addTodo(content) {
    const id = Date.now().toString()
    const todo = {
      id,
      content,
      status: 'pending',
      createdAt: Date.now(),
      startTime: null,
      completionTime: null,
    }

    this.todos.push(todo)
    this.analytics.totalTasks++
    this.saveTodos()
    this.saveAnalytics()

    console.log(`${COLORS.green}✅ Added: ${content}${COLORS.reset}`)
    return id
  }

  startTodo(id) {
    const todo = this.todos.find((t) => t.id === id)
    if (!todo) {
      console.log(`${COLORS.red}❌ Todo ${id} not found${COLORS.reset}`)
      return
    }

    if (todo.status === 'completed') {
      console.log(`${COLORS.yellow}⚠️  Todo already completed${COLORS.reset}`)
      return
    }

    const currentInProgress = this.todos.filter((t) => t.status === 'in_progress')
    if (currentInProgress.length > 0) {
      console.log(`${COLORS.yellow}⚠️  Pausing other in-progress tasks${COLORS.reset}`)
      currentInProgress.forEach((t) => {
        t.status = 'pending'
      })
    }

    todo.status = 'in_progress'
    todo.startTime = Date.now()
    this.saveTodos()

    console.log(`${COLORS.blue}🔄 Started: ${todo.content}${COLORS.reset}`)
  }

  completeTodo(id) {
    const todo = this.todos.find((t) => t.id === id)
    if (!todo) {
      console.log(`${COLORS.red}❌ Todo ${id} not found${COLORS.reset}`)
      return
    }

    if (todo.status === 'completed') {
      console.log(`${COLORS.yellow}⚠️  Todo already completed${COLORS.reset}`)
      return
    }

    const completionTime = todo.startTime ? Date.now() - todo.startTime : 0
    todo.status = 'completed'
    todo.completionTime = completionTime
    todo.completedAt = Date.now()

    this.updateAnalytics(todo)
    this.saveTodos()
    this.saveAnalytics()

    console.log(
      `${COLORS.green}✅ Completed: ${todo.content} (${this.formatDuration(completionTime)})${COLORS.reset}`
    )
  }

  updateAnalytics(completedTodo) {
    this.analytics.completedTasks++

    if (completedTodo.completionTime > 0) {
      const currentAvg = this.analytics.averageCompletionTime || 0
      const totalTime =
        currentAvg * (this.analytics.completedTasks - 1) + completedTodo.completionTime
      this.analytics.averageCompletionTime = Math.floor(totalTime / this.analytics.completedTasks)
    }

    const date = new Date(completedTodo.completedAt)
    const day = date.toISOString().split('T')[0]
    const hour = date.getHours()

    this.analytics.tasksByDay[day] = (this.analytics.tasksByDay[day] || 0) + 1
    this.analytics.tasksByHour[hour] = (this.analytics.tasksByHour[hour] || 0) + 1

    const mostProductiveHour = Object.entries(this.analytics.tasksByHour).sort(
      ([, a], [, b]) => b - a
    )[0]
    if (mostProductiveHour) {
      this.analytics.patterns.mostProductiveHour = mostProductiveHour[0]
    }

    if (
      !this.analytics.patterns.longestTask ||
      completedTodo.completionTime > this.analytics.patterns.longestTask.time
    ) {
      this.analytics.patterns.longestTask = {
        content: completedTodo.content.substring(0, 30),
        time: completedTodo.completionTime,
      }
    }

    if (
      !this.analytics.patterns.shortestTask ||
      (completedTodo.completionTime > 0 &&
        completedTodo.completionTime < this.analytics.patterns.shortestTask.time)
    ) {
      this.analytics.patterns.shortestTask = {
        content: completedTodo.content.substring(0, 30),
        time: completedTodo.completionTime,
      }
    }
  }

  removeTodo(id) {
    const index = this.todos.findIndex((t) => t.id === id)
    if (index === -1) {
      console.log(`${COLORS.red}❌ Todo ${id} not found${COLORS.reset}`)
      return
    }

    const todo = this.todos[index]
    this.todos.splice(index, 1)
    this.saveTodos()

    console.log(`${COLORS.red}🗑️  Removed: ${todo.content}${COLORS.reset}`)
  }

  clearCompleted() {
    const completedCount = this.todos.filter((t) => t.status === 'completed').length
    this.todos = this.todos.filter((t) => t.status !== 'completed')
    this.saveTodos()

    console.log(`${COLORS.green}🧹 Cleared ${completedCount} completed tasks${COLORS.reset}`)
  }

  watchMode() {
    let lastUpdate = Date.now()

    const refresh = () => {
      this.todos = this.loadTodos()
      this.analytics = this.loadAnalytics()
      this.displayBoard()

      const now = new Date()
      console.log(
        `${COLORS.dim}Last updated: ${now.toLocaleTimeString()} | Press Ctrl+C to exit${COLORS.reset}`
      )
    }

    refresh()

    fs.watchFile(TODO_FILE, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        refresh()
      }
    })

    setInterval(() => {
      const inProgress = this.todos.filter((t) => t.status === 'in_progress')
      if (inProgress.length > 0) {
        refresh()
      }
    }, 5000)

    process.on('SIGINT', () => {
      console.log(`\n${COLORS.cyan}👋 Exiting todo board...${COLORS.reset}`)
      process.exit(0)
    })
  }
}

function showHelp() {
  console.log(`
${COLORS.bright}Terminal Todo Board - Task Management with Analytics${COLORS.reset}

${COLORS.cyan}USAGE:${COLORS.reset}
  node scripts/terminal-todo-board.js [command] [options]

${COLORS.cyan}COMMANDS:${COLORS.reset}
  watch                     Display board with real-time updates
  add <content>            Add a new todo
  start <id>               Start working on a todo
  complete <id>            Mark todo as completed
  remove <id>              Remove a todo
  clear-completed          Remove all completed todos
  list                     Display current board
  analytics                Show detailed analytics
  help                     Show this help message

${COLORS.cyan}EXAMPLES:${COLORS.reset}
  node scripts/terminal-todo-board.js watch
  node scripts/terminal-todo-board.js add "Implement new feature"
  node scripts/terminal-todo-board.js start 1234567890
  node scripts/terminal-todo-board.js complete 1234567890

${COLORS.cyan}KEYBOARD SHORTCUTS (in watch mode):${COLORS.reset}
  Ctrl+C                   Exit watch mode
`)
}

function main() {
  const board = new TodoBoard()
  const [, , command, ...args] = process.argv

  switch (command) {
    case 'watch':
      board.watchMode()
      break

    case 'add':
      if (args.length === 0) {
        console.log(`${COLORS.red}❌ Please provide todo content${COLORS.reset}`)
        break
      }
      board.addTodo(args.join(' '))
      break

    case 'start':
      if (args.length === 0) {
        console.log(`${COLORS.red}❌ Please provide todo ID${COLORS.reset}`)
        break
      }
      board.startTodo(args[0])
      break

    case 'complete':
      if (args.length === 0) {
        console.log(`${COLORS.red}❌ Please provide todo ID${COLORS.reset}`)
        break
      }
      board.completeTodo(args[0])
      break

    case 'remove':
      if (args.length === 0) {
        console.log(`${COLORS.red}❌ Please provide todo ID${COLORS.reset}`)
        break
      }
      board.removeTodo(args[0])
      break

    case 'clear-completed':
      board.clearCompleted()
      break

    case 'list':
      board.displayBoard()
      break

    case 'analytics':
      board.displayAnalytics()
      break

    case 'help':
    case undefined:
      showHelp()
      break

    default:
      console.log(`${COLORS.red}❌ Unknown command: ${command}${COLORS.reset}`)
      showHelp()
  }
}

if (require.main === module) {
  main()
}

module.exports = { TodoBoard }
