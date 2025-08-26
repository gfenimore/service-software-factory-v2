#!/usr/bin/env node

/**
 * remove-version-numbers.js
 * Removes version numbers from agent/processor filenames and tracks versions inside files
 */

const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  agentsDir: '.sdlc/01-core/A-agents',
  processorsDir: '.sdlc/01-core/A-agents/processors',
  backupDir: '.backup',
  versionPattern: /-v(\d+(?:\.\d+)?)/,
  filePattern: /^(.+)-v(\d+(?:\.\d+)?)(\..+)$/,
  dryRun: false,
  rollback: false,
}

// Parse command line arguments
process.argv.forEach((arg) => {
  if (arg === '--dry-run') CONFIG.dryRun = true
  if (arg === '--rollback') CONFIG.rollback = true
})

class VersionRemover {
  constructor() {
    this.changes = []
    this.errors = []
    this.backupPath = null
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  }

  // Find all files with version numbers
  findVersionedFiles(directory) {
    const files = []

    function scan(dir) {
      if (!fs.existsSync(dir)) return

      const items = fs.readdirSync(dir)
      items.forEach((item) => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'test-twins') {
          scan(fullPath)
        } else if (stat.isFile() && CONFIG.filePattern.test(item)) {
          files.push({
            directory: dir,
            filename: item,
            fullPath: fullPath,
          })
        }
      })
    }

    scan(directory)
    return files
  }

  // Extract version from filename
  extractVersion(filename) {
    const match = filename.match(CONFIG.filePattern)
    if (match) {
      return {
        baseName: match[1],
        version: match[2],
        extension: match[3],
      }
    }
    return null
  }

  // Generate new filename without version
  getNewFilename(filename) {
    const parts = this.extractVersion(filename)
    if (parts) {
      return parts.baseName + parts.extension
    }
    return filename
  }

  // Add version header to file content
  addVersionHeader(content, filename, version) {
    const date = new Date().toISOString().split('T')[0]

    // Extract the name for the header
    const baseName = filename.replace(/\.(md|js|ts|tsx)$/, '')
    const displayName = baseName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Check if content already has a version header
    if (content.match(/^\*\*Version:/m)) {
      // Update existing version
      content = content.replace(/^\*\*Version:.*$/m, `**Version: ${version}**`)
      if (!content.match(/^\*\*Last Updated:/m)) {
        content = content.replace(/^(\*\*Version:.*\*\*)$/m, `$1\n**Last Updated: ${date}**`)
      } else {
        content = content.replace(/^\*\*Last Updated:.*$/m, `**Last Updated: ${date}**`)
      }
    } else {
      // Add new version header after the main title
      const lines = content.split('\n')
      let insertIndex = 0

      // Find the first heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
          insertIndex = i + 1
          break
        }
      }

      // Insert version info
      const versionBlock = [`**Version: ${version}**`, `**Last Updated: ${date}**`, '']

      lines.splice(insertIndex, 0, ...versionBlock)
      content = lines.join('\n')
    }

    return content
  }

  // Create backup of file
  createBackup(filePath) {
    if (CONFIG.dryRun) return

    if (!this.backupPath) {
      this.backupPath = path.join(CONFIG.backupDir, this.timestamp)
      fs.mkdirSync(this.backupPath, { recursive: true })
    }

    const relativePath = path.relative('.', filePath)
    const backupFile = path.join(this.backupPath, relativePath)
    const backupDir = path.dirname(backupFile)

    fs.mkdirSync(backupDir, { recursive: true })
    fs.copyFileSync(filePath, backupFile)

    return backupFile
  }

  // Process a single file
  processFile(file) {
    const parts = this.extractVersion(file.filename)
    if (!parts) return null

    const newFilename = this.getNewFilename(file.filename)
    const newPath = path.join(file.directory, newFilename)

    // Check for conflicts
    if (fs.existsSync(newPath) && newPath !== file.fullPath) {
      this.errors.push({
        file: file.fullPath,
        error: `Target file already exists: ${newPath}`,
      })
      return null
    }

    // Read file content
    let content = fs.readFileSync(file.fullPath, 'utf8')

    // Add version header
    const updatedContent = this.addVersionHeader(content, newFilename, parts.version)

    // Record the change
    const change = {
      oldPath: file.fullPath,
      newPath: newPath,
      oldFilename: file.filename,
      newFilename: newFilename,
      version: parts.version,
      contentChanged: content !== updatedContent,
      backup: null,
    }

    if (!CONFIG.dryRun) {
      // Create backup
      change.backup = this.createBackup(file.fullPath)

      // Write updated content
      fs.writeFileSync(file.fullPath, updatedContent)

      // Rename file if needed
      if (file.fullPath !== newPath) {
        fs.renameSync(file.fullPath, newPath)
      }
    }

    this.changes.push(change)
    return change
  }

  // Update references in other files
  updateReferences() {
    if (CONFIG.dryRun) return []

    const updates = []
    const searchDirs = ['.sdlc', 'scripts', 'src']

    this.changes.forEach((change) => {
      if (change.oldFilename === change.newFilename) return

      searchDirs.forEach((dir) => {
        if (!fs.existsSync(dir)) return

        const files = this.findAllFiles(dir, ['.md', '.js', '.ts', '.tsx', '.json'])
        files.forEach((file) => {
          const content = fs.readFileSync(file, 'utf8')
          if (content.includes(change.oldFilename)) {
            const newContent = content.replace(
              new RegExp(change.oldFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              change.newFilename
            )

            fs.writeFileSync(file, newContent)
            updates.push({
              file: file,
              oldRef: change.oldFilename,
              newRef: change.newFilename,
            })
          }
        })
      })
    })

    return updates
  }

  // Find all files with given extensions
  findAllFiles(dir, extensions) {
    const files = []

    function scan(directory) {
      if (!fs.existsSync(directory)) return

      const items = fs.readdirSync(directory)
      items.forEach((item) => {
        const fullPath = path.join(directory, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(item)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    }

    scan(dir)
    return files
  }

  // Rollback changes
  rollback() {
    // Find the most recent backup
    const backups = fs
      .readdirSync(CONFIG.backupDir)
      .filter((dir) => fs.statSync(path.join(CONFIG.backupDir, dir)).isDirectory())
      .sort()
      .reverse()

    if (backups.length === 0) {
      console.log('No backups found to rollback')
      return
    }

    const latestBackup = path.join(CONFIG.backupDir, backups[0])
    console.log(`Rolling back from backup: ${latestBackup}`)

    // Restore files
    this.restoreFromBackup(latestBackup, '.')

    console.log('Rollback complete')
  }

  // Restore files from backup
  restoreFromBackup(backupDir, targetDir) {
    const items = fs.readdirSync(backupDir)

    items.forEach((item) => {
      const backupPath = path.join(backupDir, item)
      const targetPath = path.join(targetDir, item)
      const stat = fs.statSync(backupPath)

      if (stat.isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true })
        this.restoreFromBackup(backupPath, targetPath)
      } else {
        fs.copyFileSync(backupPath, targetPath)
        console.log(`Restored: ${targetPath}`)
      }
    })
  }

  // Generate report
  generateReport(references) {
    const report = []

    report.push('# Version Number Removal Report')
    report.push('')
    report.push('## Summary')
    report.push(`- Timestamp: ${new Date().toISOString()}`)
    report.push(`- Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'EXECUTED'}`)
    report.push(`- Files processed: ${this.changes.length}`)
    report.push(
      `- Files renamed: ${this.changes.filter((c) => c.oldFilename !== c.newFilename).length}`
    )
    report.push(`- References updated: ${references ? references.length : 0}`)

    if (this.backupPath) {
      report.push(`- Backups created: ${this.backupPath}`)
    }

    if (this.errors.length > 0) {
      report.push(`- Errors: ${this.errors.length}`)
    }

    report.push('')
    report.push('## Changes Made')
    report.push('')

    // Group changes by directory
    const agentChanges = this.changes.filter((c) => !c.oldPath.includes('/processors/'))
    const processorChanges = this.changes.filter((c) => c.oldPath.includes('/processors/'))

    if (agentChanges.length > 0) {
      report.push('### Agent Files')
      agentChanges.forEach((change) => {
        const renamed = change.oldFilename !== change.newFilename
        const status = renamed ? '→' : '✓'
        report.push(
          `- ${change.oldFilename} ${status} ${change.newFilename} (Version: ${change.version})`
        )
      })
      report.push('')
    }

    if (processorChanges.length > 0) {
      report.push('### Processor Files')
      processorChanges.forEach((change) => {
        const renamed = change.oldFilename !== change.newFilename
        const status = renamed ? '→' : '✓'
        report.push(
          `- ${change.oldFilename} ${status} ${change.newFilename} (Version: ${change.version})`
        )
      })
      report.push('')
    }

    if (references && references.length > 0) {
      report.push('## References Updated')
      references.forEach((ref) => {
        report.push(`- ${ref.file}: ${ref.oldRef} → ${ref.newRef}`)
      })
      report.push('')
    } else {
      report.push('## References Updated')
      report.push('- None found')
      report.push('')
    }

    if (this.errors.length > 0) {
      report.push('## Errors')
      this.errors.forEach((err) => {
        report.push(`- ${err.file}: ${err.error}`)
      })
      report.push('')
    }

    report.push('## Next Steps')
    report.push('1. Test agent invocations with new filenames')
    report.push('2. Verify all references are updated')
    report.push('3. Commit changes if everything works')
    report.push('4. Delete backups after verification')

    return report.join('\n')
  }

  // Main execution
  run() {
    console.log('Version Number Removal Tool')
    console.log('===========================\n')

    if (CONFIG.rollback) {
      this.rollback()
      return
    }

    if (CONFIG.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n')
    }

    // Find all versioned files
    console.log('Scanning for versioned files...')
    const agentFiles = this.findVersionedFiles(CONFIG.agentsDir)

    console.log(`Found ${agentFiles.length} versioned files\n`)

    if (agentFiles.length === 0) {
      console.log('No versioned files found. Nothing to do.')
      return
    }

    // Process each file
    console.log('Processing files...')
    agentFiles.forEach((file) => {
      const result = this.processFile(file)
      if (result) {
        const action = CONFIG.dryRun ? '[DRY RUN]' : '[PROCESSED]'
        const renamed = result.oldFilename !== result.newFilename
        console.log(
          `${action} ${result.oldFilename}${renamed ? ' → ' + result.newFilename : ''} (v${result.version})`
        )
      }
    })

    // Update references
    let references = []
    if (!CONFIG.dryRun && this.changes.length > 0) {
      console.log('\nUpdating references...')
      references = this.updateReferences()
      console.log(`Updated ${references.length} references`)
    }

    // Generate and save report
    const report = this.generateReport(references)
    const reportPath = 'version-removal-report.md'

    fs.writeFileSync(reportPath, report)
    console.log(`\n✅ Report saved to: ${reportPath}`)

    // Display summary
    console.log('\n' + '='.repeat(50))
    if (CONFIG.dryRun) {
      console.log('DRY RUN COMPLETE - Review the report and run without --dry-run to execute')
    } else {
      console.log('VERSION REMOVAL COMPLETE')
      console.log(`Files processed: ${this.changes.length}`)
      console.log(`Backups saved to: ${this.backupPath}`)
      console.log('\nNext: Test agent invocations to ensure everything works')
    }
  }
}

// Main execution
const remover = new VersionRemover()
remover.run()
