#!/usr/bin/env node

/**
 * Chat Exporter - Enhanced version of document generator with chat-specific features
 * Integrates with existing project structure and supports multiple input formats
 */

const fs = require('fs')
const path = require('path')
const { DocumentGenerator } = require('./document-generator')

class ChatExporter extends DocumentGenerator {
  constructor() {
    super()
    this.projectReports = []
  }

  /**
   * Export existing project reports to multiple formats
   */
  async exportProjectReports() {
    const reportsDir = '.sdlc/inventory-reports'
    if (!fs.existsSync(reportsDir)) {
      console.log('❌ No project reports directory found')
      return
    }

    const reportFiles = fs
      .readdirSync(reportsDir)
      .filter((file) => file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)) // newest first

    if (reportFiles.length === 0) {
      console.log('❌ No markdown reports found to export')
      return
    }

    console.log(`📊 Found ${reportFiles.length} project reports to export...`)

    for (const file of reportFiles.slice(0, 3)) {
      // Export latest 3 reports
      const filePath = path.join(reportsDir, file)
      const content = fs.readFileSync(filePath, 'utf8')
      const reportName = path.basename(file, '.md')

      console.log(`\n🔄 Processing: ${file}`)

      try {
        const structuredData = this.parseMarkdownReport(content, reportName)
        await this.generateAllFormats(structuredData, `report_${reportName}`)
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message)
      }
    }
  }

  /**
   * Parse markdown report into structured data
   */
  parseMarkdownReport(content, reportName) {
    const lines = content.split('\n')
    const sections = []
    let currentSection = null
    let summary = {}

    // Extract metadata and sections
    lines.forEach((line, index) => {
      line = line.trim()

      // Headers
      if (line.startsWith('# ')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line.replace('# ', ''),
          content: [],
          level: 1,
        }
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line.replace('## ', ''),
          content: [],
          level: 2,
        }
      } else if (line.startsWith('### ')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line.replace('### ', ''),
          content: [],
          level: 3,
        }
      } else if (line && currentSection) {
        currentSection.content.push(line)
      }

      // Extract summary data (look for patterns like "- **Key**: Value")
      if (line.includes('**') && line.includes(':')) {
        const match = line.match(/\*\*([^*]+)\*\*:?\s*(.+)/)
        if (match) {
          summary[match[1]] = match[2]
        }
      }
    })

    // Add final section
    if (currentSection) {
      sections.push(currentSection)
    }

    // Convert to conversation-like format for document generation
    const conversations = sections.map((section, index) => ({
      speaker: `Section ${index + 1}`,
      message: `${section.title}\n\n${section.content.join('\n')}`,
      timestamp: new Date().toISOString(),
      type: `heading_${section.level}`,
    }))

    return {
      title: `Project Report: ${reportName}`,
      conversations: conversations,
      summary: {
        'Report Name': reportName,
        Sections: sections.length,
        Generated: new Date().toLocaleDateString(),
        ...summary,
      },
    }
  }

  /**
   * Export Claude/AI chat conversations from various sources
   */
  async exportFromClaudeFiles() {
    const claudeFiles = [
      '.claude/chat-history.json',
      '.claude/conversation.txt',
      'claude-chat.txt',
      'conversation.md',
    ]

    for (const file of claudeFiles) {
      if (fs.existsSync(file)) {
        console.log(`📝 Found Claude conversation: ${file}`)

        try {
          let data
          if (file.endsWith('.json')) {
            const jsonContent = JSON.parse(fs.readFileSync(file, 'utf8'))
            data = this.parseClaudeJSON(jsonContent)
          } else {
            const textContent = fs.readFileSync(file, 'utf8')
            data = this.parseChatFromText(textContent)
          }

          const baseName = path.basename(file, path.extname(file))
          await this.generateAllFormats(data, `claude_${baseName}`)
        } catch (error) {
          console.error(`❌ Error processing ${file}:`, error.message)
        }
      }
    }
  }

  /**
   * Parse Claude JSON format
   */
  parseClaudeJSON(jsonData) {
    const conversations = []

    if (jsonData.messages) {
      jsonData.messages.forEach((msg, index) => {
        conversations.push({
          speaker: msg.role === 'user' ? 'Human' : 'Assistant',
          message: msg.content || msg.text || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          index: index,
        })
      })
    } else if (Array.isArray(jsonData)) {
      jsonData.forEach((item, index) => {
        conversations.push({
          speaker: item.speaker || (index % 2 === 0 ? 'Human' : 'Assistant'),
          message: item.message || item.content || JSON.stringify(item),
          timestamp: item.timestamp || new Date().toISOString(),
          index: index,
        })
      })
    }

    return {
      title: 'Claude AI Conversation Export',
      conversations: conversations,
      summary: {
        'Total Messages': conversations.length,
        'Human Messages': conversations.filter((c) => c.speaker === 'Human').length,
        'Assistant Messages': conversations.filter((c) => c.speaker === 'Assistant').length,
        Source: 'Claude JSON',
      },
    }
  }

  /**
   * Export current todo board to documents
   */
  async exportTodoBoard() {
    const todoFile = '.terminal-todo-board.json'
    if (!fs.existsSync(todoFile)) {
      console.log('❌ No todo board found')
      return
    }

    console.log('📋 Exporting todo board...')
    const todos = JSON.parse(fs.readFileSync(todoFile, 'utf8'))

    const conversations = todos.map((todo, index) => ({
      speaker: `Task ${index + 1}`,
      message: `Status: ${todo.status}\nContent: ${todo.content}\nCreated: ${todo.created || 'Unknown'}`,
      timestamp: todo.created || new Date().toISOString(),
      type: 'todo',
    }))

    const todoData = {
      title: 'Project Todo Board Export',
      conversations: conversations,
      summary: {
        'Total Tasks': todos.length,
        Completed: todos.filter((t) => t.status === 'completed').length,
        'In Progress': todos.filter((t) => t.status === 'in_progress').length,
        Pending: todos.filter((t) => t.status === 'pending').length,
        'Export Date': new Date().toLocaleDateString(),
      },
    }

    await this.generateAllFormats(todoData, 'project_todos')
  }
}

// CLI Usage
async function main() {
  const exporter = new ChatExporter()
  const [, , command, ...args] = process.argv

  if (!command) {
    console.log(`
🚀 Chat Exporter - Export conversations and reports to Excel, PDF, and Word

USAGE:
  node scripts/chat-exporter.js [command] [options]

COMMANDS:
  all                     Export everything (reports, todos, claude files)
  reports                 Export project reports from .sdlc/inventory-reports
  claude                  Export Claude conversation files
  todos                   Export current todo board
  chat <file> [output]    Export specific chat file
  demo                    Generate demo files

EXAMPLES:
  node scripts/chat-exporter.js all
  node scripts/chat-exporter.js reports
  node scripts/chat-exporter.js claude
  node scripts/chat-exporter.js todos
  node scripts/chat-exporter.js chat conversation.txt
`)
    return
  }

  try {
    switch (command) {
      case 'all':
        console.log('🚀 Exporting all available data...\n')
        await exporter.exportProjectReports()
        await exporter.exportFromClaudeFiles()
        await exporter.exportTodoBoard()
        console.log('\n✅ Complete export finished!')
        break

      case 'reports':
        await exporter.exportProjectReports()
        break

      case 'claude':
        await exporter.exportFromClaudeFiles()
        break

      case 'todos':
        await exporter.exportTodoBoard()
        break

      case 'chat':
        const [inputFile, outputName] = args
        if (!inputFile || !fs.existsSync(inputFile)) {
          console.error('❌ Please provide a valid chat file path')
          return
        }

        const textContent = fs.readFileSync(inputFile, 'utf8')
        const chatData = exporter.parseChatFromText(textContent)
        await exporter.generateAllFormats(chatData, outputName || 'chat_export')
        break

      case 'demo':
        const demoData = {
          title: 'Service Software Factory - Chat Export Demo',
          conversations: [
            {
              speaker: 'Human',
              message:
                'Can you help me export our project conversations to different document formats?',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              speaker: 'Assistant',
              message:
                'Absolutely! I can help you export conversations to Excel, PDF, and Word formats. This is particularly useful for:\n\n1. **Excel (.xlsx)** - Great for data analysis, filtering conversations, and creating charts\n2. **PDF** - Perfect for sharing with stakeholders and archiving\n3. **Word (.docx)** - Ideal for creating formatted reports and documentation\n\nThe system can export from various sources including project reports, todo boards, and chat conversations.',
              timestamp: new Date(Date.now() - 6900000).toISOString(),
            },
            {
              speaker: 'Human',
              message:
                'That sounds perfect for our project documentation needs. What sources can you export from?',
              timestamp: new Date(Date.now() - 6600000).toISOString(),
            },
            {
              speaker: 'Assistant',
              message:
                'The chat exporter can handle multiple data sources:\n\n**Project Data:**\n- SDLC inventory reports from .sdlc/inventory-reports/\n- Todo board exports from terminal-todo-board\n- Project audit reports\n\n**Chat Sources:**\n- Claude conversation files\n- Plain text chat logs\n- JSON formatted conversations\n- Markdown conversation files\n\nEach export includes metadata like message counts, timestamps, and conversation summaries for better analysis.',
              timestamp: new Date().toISOString(),
            },
          ],
          summary: {
            Project: 'Service Software Factory v2',
            'Export Type': 'Demo',
            'Total Messages': 4,
            'Human Messages': 2,
            'Assistant Messages': 2,
            Features: 'Multi-format export (Excel, PDF, Word)',
          },
        }

        await exporter.generateAllFormats(demoData, 'service_factory_demo')
        break

      default:
        console.error(
          '❌ Unknown command. Use "all", "reports", "claude", "todos", "chat", or "demo"'
        )
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { ChatExporter }
