# Document Export Guide

**Generate Excel, PDF, and Word documents from chat conversations and project data**

## 🚀 Quick Start

The Service Software Factory now supports exporting chat conversations, project reports, and structured data to multiple document formats:

- **Excel (.xlsx)** - Perfect for data analysis and filtering
- **PDF** - Ideal for sharing and archiving
- **Word (.docx)** - Great for formatted reports and documentation

## 📦 Available Commands

### NPM Scripts (Recommended)

```bash
# Export everything (reports, todos, conversations)
npm run export:all

# Export project reports only
npm run export:reports

# Export todo board
npm run export:todos

# Generate demo files
npm run export:demo

# Export specific chat file
npm run export:chat conversation.txt

# Export JSON data
npm run export:json data.json
```

### Direct Script Usage

```bash
# Full-featured chat exporter
node scripts/chat-exporter.js [command]

# Basic document generator
node scripts/document-generator.js [command]
```

## 📊 What Gets Exported

### 1. Project Reports (`export:reports`)

Automatically converts markdown reports from `.sdlc/inventory-reports/` including:

- SDLC audit reports
- Project reorganization plans
- Inventory summaries
- Any custom markdown reports

### 2. Todo Board (`export:todos`)

Exports your current todo board with:

- Task status breakdown
- Completion statistics
- Task details and timestamps

### 3. Chat Conversations (`export:chat`)

Supports multiple input formats:

- Plain text conversations
- Claude conversation files
- JSON formatted chats
- Markdown conversation files

## 📋 Export Features

### Excel (.xlsx) Format

- **Tabular Data**: Conversations in rows with columns for speaker, message, timestamp
- **Summary Sheet**: Statistics and metadata
- **Styling**: Headers, colors, and formatting
- **Multiple Worksheets**: Separate sheets for different data types

### PDF Format

- **Formatted Layout**: Professional document styling
- **Conversation Flow**: Clear speaker identification
- **Metadata Header**: Export date and summary info
- **Multi-page Support**: Automatic page breaks

### Word (.docx) Format

- **Structured Document**: Proper headings and formatting
- **Tables**: Summary data in formatted tables
- **Professional Style**: Consistent typography and layout
- **Conversation Blocks**: Clear message separation

## 🎯 Use Cases

### 1. Project Documentation

```bash
# Export all project reports for stakeholder review
npm run export:reports
```

### 2. Chat Archive

```bash
# Archive important conversations
npm run export:chat important_discussion.txt archive_jan2024
```

### 3. Progress Reports

```bash
# Create formatted progress reports
npm run export:todos
```

### 4. Data Analysis

```bash
# Generate Excel files for conversation analysis
npm run export:json conversation_data.json analysis_report
```

## 📁 File Locations

All exported files are saved to the `exports/` directory:

```
exports/
├── demo_conversation.xlsx
├── demo_conversation.pdf
├── demo_conversation.docx
├── report_sdlc-audit-2025-08-10.xlsx
├── report_sdlc-audit-2025-08-10.pdf
└── report_sdlc-audit-2025-08-10.docx
```

## 🔧 Advanced Usage

### Custom Chat Format

The system automatically detects conversation patterns like:

```
Human: Your question here
Assistant: My response here
```

### JSON Data Structure

For JSON exports, use this structure:

```json
{
  "title": "My Conversation Export",
  "conversations": [
    {
      "speaker": "Human",
      "message": "Hello!",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "Total Messages": 2,
    "Export Date": "2024-01-15"
  }
}
```

### Markdown Reports

The system parses markdown files and converts them to conversation-like format, preserving:

- Heading structure
- Section content
- Summary data from bold patterns like `**Key**: Value`

## 🛠️ Technical Details

### Dependencies

- **exceljs**: Excel file generation
- **jspdf**: PDF creation
- **docx**: Word document generation
- **puppeteer**: Advanced PDF features (if needed)

### Supported Input Formats

- Plain text (.txt)
- Markdown (.md)
- JSON (.json)
- CSV (via JSON conversion)

### Output Capabilities

- Multi-format simultaneous export
- Automatic file naming with timestamps
- Metadata preservation
- Summary statistics generation

## 💡 Tips & Best Practices

### 1. Organize Your Exports

Create dated exports for better organization:

```bash
npm run export:reports
# Files automatically include dates in names
```

### 2. Use Descriptive Names

```bash
npm run export:chat weekly_standup.txt standup_week_3
```

### 3. Regular Backups

Export important conversations regularly:

```bash
# Add to your workflow
npm run export:all
```

### 4. Data Analysis

Use Excel exports for:

- Message frequency analysis
- Speaker participation metrics
- Timeline analysis
- Content categorization

## 🐛 Troubleshooting

### Common Issues

1. **File not found**: Ensure input files exist and paths are correct
2. **Permission errors**: Check write permissions for `exports/` directory
3. **Large files**: For very large conversations, consider splitting into smaller files
4. **Memory issues**: Process large datasets in smaller chunks

### Error Messages

- `❌ Please provide a valid file path` - Check file exists
- `❌ No project reports found` - Run from project root directory
- `❌ Error generating documents` - Check file permissions and disk space

## 📈 Examples

### Example 1: Export Recent Project Reports

```bash
npm run export:reports
# Creates Excel, PDF, and Word versions of all recent markdown reports
```

### Example 2: Archive Customer Conversation

```bash
# Save text conversation to files
npm run export:chat customer_feedback_jan.txt customer_jan_archive

# Results in:
# - customer_jan_archive.xlsx
# - customer_jan_archive.pdf
# - customer_jan_archive.docx
```

### Example 3: Generate Comprehensive Project Export

```bash
npm run export:all
# Exports everything: reports, todos, and any conversation files found
```

This document export system transforms your conversational data into professional, shareable formats that integrate seamlessly with your existing project workflows.
