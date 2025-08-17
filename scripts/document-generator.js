#!/usr/bin/env node

/**
 * Document Generator - Generate files in multiple formats from chat conversations or any structured data
 * Supports: .xlsx (Excel), .pdf (PDF), .docx (Word)
 */

const fs = require('fs')
const path = require('path')
const ExcelJS = require('exceljs')
const { jsPDF } = require('jspdf')
const {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require('docx')

class DocumentGenerator {
  constructor() {
    this.outputDir = 'exports'
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * Generate Excel (.xlsx) file from structured data
   */
  async generateExcel(data, filename = 'export') {
    const workbook = new ExcelJS.Workbook()

    if (data.conversations) {
      // Chat conversation format
      const worksheet = workbook.addWorksheet('Chat Conversations')

      // Headers
      worksheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 20 },
        { header: 'Speaker', key: 'speaker', width: 15 },
        { header: 'Message', key: 'message', width: 80 },
        { header: 'Type', key: 'type', width: 15 },
      ]

      // Style headers
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // Add data
      data.conversations.forEach((conv, index) => {
        worksheet.addRow({
          timestamp: conv.timestamp || new Date().toISOString(),
          speaker: conv.speaker || 'User',
          message: conv.message || conv.content || '',
          type: conv.type || 'text',
        })
      })

      // Add summary sheet if available
      if (data.summary) {
        const summarySheet = workbook.addWorksheet('Summary')
        summarySheet.columns = [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 },
        ]

        Object.entries(data.summary).forEach(([key, value]) => {
          summarySheet.addRow({ metric: key, value: value })
        })
      }
    } else {
      // Generic tabular data
      const worksheet = workbook.addWorksheet('Data')

      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        worksheet.columns = headers.map((header) => ({
          header: header,
          key: header,
          width: 20,
        }))

        data.forEach((row) => {
          worksheet.addRow(row)
        })
      }
    }

    const filePath = path.join(this.outputDir, `${filename}.xlsx`)
    await workbook.xlsx.writeFile(filePath)
    return filePath
  }

  /**
   * Generate PDF file from structured data
   */
  async generatePDF(data, filename = 'export') {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const lineHeight = 10
    let currentY = margin

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(data.title || 'Chat Conversation Export', margin, currentY)
    currentY += lineHeight * 2

    // Metadata
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, currentY)
    currentY += lineHeight * 1.5

    if (data.conversations) {
      data.conversations.forEach((conv, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - margin - 30) {
          doc.addPage()
          currentY = margin
        }

        // Speaker/Timestamp
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        const speaker = conv.speaker || 'User'
        const timestamp = conv.timestamp ? new Date(conv.timestamp).toLocaleString() : ''
        doc.text(`${speaker} - ${timestamp}`, margin, currentY)
        currentY += lineHeight

        // Message content
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const message = conv.message || conv.content || ''

        // Split long messages into lines
        const maxWidth = pageWidth - margin * 2
        const lines = doc.splitTextToSize(message, maxWidth)

        lines.forEach((line) => {
          if (currentY > pageHeight - margin - 10) {
            doc.addPage()
            currentY = margin
          }
          doc.text(line, margin + 5, currentY)
          currentY += 6
        })

        currentY += lineHeight * 0.5 // Space between messages
      })
    }

    const filePath = path.join(this.outputDir, `${filename}.pdf`)
    doc.save(filePath)
    return filePath
  }

  /**
   * Generate Word (.docx) file from structured data
   */
  async generateDocx(data, filename = 'export') {
    const children = []

    // Title
    children.push(
      new Paragraph({
        text: data.title || 'Chat Conversation Export',
        heading: HeadingLevel.TITLE,
      })
    )

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleString()}`,
            italics: true,
          }),
        ],
      })
    )

    children.push(new Paragraph({ text: '' })) // Empty line

    if (data.conversations) {
      // Summary table if available
      if (data.summary) {
        children.push(
          new Paragraph({
            text: 'Summary',
            heading: HeadingLevel.HEADING_1,
          })
        )

        const summaryRows = Object.entries(data.summary).map(
          ([key, value]) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(key)],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(String(value))],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
              ],
            })
        )

        children.push(
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Metric', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Value', bold: true })],
                  }),
                ],
              }),
              ...summaryRows,
            ],
          })
        )

        children.push(new Paragraph({ text: '' })) // Empty line
      }

      // Conversations
      children.push(
        new Paragraph({
          text: 'Conversations',
          heading: HeadingLevel.HEADING_1,
        })
      )

      data.conversations.forEach((conv, index) => {
        // Speaker header
        const speaker = conv.speaker || 'User'
        const timestamp = conv.timestamp ? new Date(conv.timestamp).toLocaleString() : ''

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${speaker}`,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: ` - ${timestamp}`,
                italics: true,
                size: 20,
              }),
            ],
          })
        )

        // Message content
        const message = conv.message || conv.content || ''
        children.push(
          new Paragraph({
            text: message,
          })
        )

        children.push(new Paragraph({ text: '' })) // Empty line between messages
      })
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })

    const filePath = path.join(this.outputDir, `${filename}.docx`)
    const buffer = await Packer.toBuffer(doc)
    fs.writeFileSync(filePath, buffer)
    return filePath
  }

  /**
   * Generate all formats from chat data
   */
  async generateAllFormats(data, baseFilename = 'chat_export') {
    const results = {}

    try {
      console.log('📊 Generating Excel file...')
      results.excel = await this.generateExcel(data, baseFilename)
      console.log(`✅ Excel: ${results.excel}`)

      console.log('📄 Generating PDF file...')
      results.pdf = await this.generatePDF(data, baseFilename)
      console.log(`✅ PDF: ${results.pdf}`)

      console.log('📝 Generating Word document...')
      results.docx = await this.generateDocx(data, baseFilename)
      console.log(`✅ Word: ${results.docx}`)

      console.log('\n🎉 All formats generated successfully!')
      console.log(`📁 Files saved in: ${path.resolve(this.outputDir)}`)

      return results
    } catch (error) {
      console.error('❌ Error generating documents:', error)
      throw error
    }
  }

  /**
   * Parse chat conversation from text file or string
   */
  parseChatFromText(textContent) {
    const conversations = []
    const lines = textContent.split('\n')

    let currentMessage = ''
    let currentSpeaker = 'User'
    let messageCount = 0

    lines.forEach((line, index) => {
      line = line.trim()
      if (!line) return

      // Try to detect speaker changes (simple heuristic)
      if (line.includes('Human:') || line.includes('User:')) {
        if (currentMessage) {
          conversations.push({
            speaker: currentSpeaker,
            message: currentMessage.trim(),
            timestamp: new Date().toISOString(),
            index: messageCount++,
          })
        }
        currentSpeaker = 'Human'
        currentMessage = line.replace(/^(Human|User):\s*/, '')
      } else if (line.includes('Assistant:') || line.includes('AI:')) {
        if (currentMessage) {
          conversations.push({
            speaker: currentSpeaker,
            message: currentMessage.trim(),
            timestamp: new Date().toISOString(),
            index: messageCount++,
          })
        }
        currentSpeaker = 'Assistant'
        currentMessage = line.replace(/^(Assistant|AI):\s*/, '')
      } else {
        currentMessage += ' ' + line
      }
    })

    // Add final message
    if (currentMessage) {
      conversations.push({
        speaker: currentSpeaker,
        message: currentMessage.trim(),
        timestamp: new Date().toISOString(),
        index: messageCount++,
      })
    }

    return {
      title: 'Chat Conversation Export',
      conversations: conversations,
      summary: {
        'Total Messages': conversations.length,
        'Human Messages': conversations.filter((c) => c.speaker === 'Human').length,
        'Assistant Messages': conversations.filter((c) => c.speaker === 'Assistant').length,
        'Export Date': new Date().toLocaleDateString(),
        'Export Time': new Date().toLocaleTimeString(),
      },
    }
  }
}

// CLI Usage
async function main() {
  const generator = new DocumentGenerator()
  const [, , command, inputFile, outputName] = process.argv

  if (!command) {
    console.log(`
📄 Document Generator - Convert data to Excel, PDF, and Word formats

USAGE:
  node scripts/document-generator.js [command] [options]

COMMANDS:
  demo                          Generate demo files with sample data
  chat <input.txt> [output]     Convert chat text file to documents
  json <input.json> [output]    Convert JSON data to documents

EXAMPLES:
  node scripts/document-generator.js demo
  node scripts/document-generator.js chat conversation.txt my_chat
  node scripts/document-generator.js json data.json report
`)
    return
  }

  try {
    switch (command) {
      case 'demo':
        const demoData = {
          title: 'Demo Chat Conversation',
          conversations: [
            {
              speaker: 'Human',
              message:
                'Hello! Can you help me understand how to generate documents from our chat conversations?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              speaker: 'Assistant',
              message:
                'Absolutely! I can help you generate Excel (.xlsx), PDF, and Word (.docx) files from chat conversations. This is useful for creating reports, documentation, or archives of important discussions.',
              timestamp: new Date(Date.now() - 3300000).toISOString(),
            },
            {
              speaker: 'Human',
              message: 'That sounds perfect! What formats do you support?',
              timestamp: new Date(Date.now() - 3000000).toISOString(),
            },
            {
              speaker: 'Assistant',
              message:
                'I support three main formats:\n1. Excel (.xlsx) - Great for tabular data and analysis\n2. PDF - Perfect for sharing and archiving\n3. Word (.docx) - Ideal for structured documents and reports\n\nEach format preserves the conversation flow, timestamps, and speaker information.',
              timestamp: new Date().toISOString(),
            },
          ],
          summary: {
            'Total Messages': 4,
            'Human Messages': 2,
            'Assistant Messages': 2,
            Demo: 'Yes',
          },
        }

        await generator.generateAllFormats(demoData, 'demo_conversation')
        break

      case 'chat':
        if (!inputFile || !fs.existsSync(inputFile)) {
          console.error('❌ Please provide a valid text file path')
          return
        }

        const textContent = fs.readFileSync(inputFile, 'utf8')
        const chatData = generator.parseChatFromText(textContent)
        await generator.generateAllFormats(chatData, outputName || 'chat_export')
        break

      case 'json':
        if (!inputFile || !fs.existsSync(inputFile)) {
          console.error('❌ Please provide a valid JSON file path')
          return
        }

        const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
        await generator.generateAllFormats(jsonData, outputName || 'json_export')
        break

      default:
        console.error('❌ Unknown command. Use "demo", "chat", or "json"')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { DocumentGenerator }
