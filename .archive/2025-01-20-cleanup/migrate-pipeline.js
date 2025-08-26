#!/usr/bin/env node

/**
 * Migration Script: Reorganize .pipeline to clean 1-5 structure
 * Run from project root!
 */

const fs = require('fs');
const path = require('path');

class PipelineMigration {
    constructor() {
        this.baseDir = process.cwd();
        this.pipelineDir = path.join(this.baseDir, '.pipeline');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        this.backupDir = path.join(this.pipelineDir, `migration-backup-${this.timestamp}`);
        this.migrationLog = [];
        this.updatedFiles = [];
    }

    log(message, detail = '') {
        console.log(message);
        this.migrationLog.push({ 
            timestamp: new Date().toISOString(), 
            message, 
            detail 
        });
    }

    /**
     * Step 1: Create backup of existing structure
     */
    createBackup() {
        this.log('📦 Creating backup of existing structure...');
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // List of directories to backup
        const dirsToBackup = [
            'concept', 'config', 'current', 'factory', 
            'graduated', 'production', 'prototype', 
            'requirements', 'runs', 'specs', 'staging'
        ];

        dirsToBackup.forEach(dir => {
            const sourcePath = path.join(this.pipelineDir, dir);
            if (fs.existsSync(sourcePath)) {
                const destPath = path.join(this.backupDir, dir);
                this.copyRecursive(sourcePath, destPath);
                this.log(`  ✅ Backed up ${dir}/`);
            }
        });

        // Backup root files
        const rootFiles = fs.readdirSync(this.pipelineDir)
            .filter(f => {
                const fullPath = path.join(this.pipelineDir, f);
                return fs.statSync(fullPath).isFile();
            });
        
        rootFiles.forEach(file => {
            const sourcePath = path.join(this.pipelineDir, file);
            const destPath = path.join(this.backupDir, file);
            fs.copyFileSync(sourcePath, destPath);
        });

        this.log(`✅ Backup created at: migration-backup-${this.timestamp}`);
    }

    /**
     * Step 2: Create new directory structure
     */
    createNewStructure() {
        this.log('\n🏗️ Creating new numbered structure...');

        const newStructure = [
            '1-inputs/requirements',
            '1-inputs/config',
            '2-factory/agents',
            '2-factory/processors',
            '2-factory/orchestration',
            '2-factory/validation',  // Added per Claude's suggestion
            '3-workspace/concept',
            '3-workspace/prototype',
            '3-workspace/production',
            '3-workspace/manifests',
            '3-workspace/runs',
            '4-outputs/concept',
            '4-outputs/prototype',
            '4-outputs/production',
            '5-archive',
            'docs/architecture',
            'docs/guides',
            'docs/lessons'
        ];

        newStructure.forEach(dir => {
            const fullPath = path.join(this.pipelineDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                this.log(`  ✅ Created ${dir}/`);
            }
        });
    }

    /**
     * Step 3: Migrate content to new locations
     */
    migrateContent() {
        this.log('\n📦 Migrating content to new structure...');

        const migrations = [
            // Requirements
            { 
                from: 'requirements', 
                to: '1-inputs/requirements',
                description: 'Business requirements and generated artifacts'
            },
            
            // Config
            { 
                from: 'config', 
                to: '1-inputs/config',
                description: 'Pipeline configuration files'
            },
            
            // Factory components
            { 
                from: 'factory/agents', 
                to: '2-factory/agents',
                description: 'Agent definitions'
            },
            { 
                from: 'factory/processors', 
                to: '2-factory/processors',
                description: 'Processor definitions'
            },
            { 
                from: 'factory/transformers', 
                to: '2-factory/processors/transformers',
                description: 'Transformation processors'
            },
            
            // Active work (workspace)
            { 
                from: 'concept', 
                to: '3-workspace/concept',
                description: 'Active concept work'
            },
            { 
                from: 'prototype', 
                to: '3-workspace/prototype',
                description: 'Active prototype work'
            },
            { 
                from: 'production', 
                to: '3-workspace/production',
                description: 'Active production work'
            },
            { 
                from: 'current', 
                to: '3-workspace/current',
                description: 'Current work in progress'
            },
            { 
                from: 'runs', 
                to: '3-workspace/runs',
                description: 'Recent pipeline runs'
            },
            
            // Completed outputs
            { 
                from: 'graduated', 
                to: '4-outputs',
                description: 'Graduated/completed outputs',
                merge: true
            },
            
            // Archive
            { 
                from: 'archive', 
                to: '5-archive',
                description: 'Historical runs and artifacts',
                merge: true
            },
            
            // Documentation
            { 
                from: 'specs', 
                to: 'docs/architecture',
                description: 'Technical specifications'
            }
        ];

        // Move orchestration scripts
        const orchestrationFiles = ['run-pipeline.js', 'run-complete-pipeline.js', 'executor.js'];
        orchestrationFiles.forEach(file => {
            const sourcePath = path.join(this.pipelineDir, 'factory', file);
            if (fs.existsSync(sourcePath)) {
                const destPath = path.join(this.pipelineDir, '2-factory/orchestration', file);
                this.moveFile(sourcePath, destPath);
                this.log(`  ✅ Moved ${file} to orchestration/`);
            }
        });

        // Move documentation files
        const docFiles = [
            { from: 'factory/FACTORY-SUCCESS-SUMMARY.md', to: 'docs/lessons/FACTORY-SUCCESS-SUMMARY.md' },
            { from: 'factory/PROCESSOR-ANALYSIS.md', to: 'docs/architecture/PROCESSOR-ANALYSIS.md' },
            { from: 'factory/PROCESSOR-PROPOSAL.md', to: 'docs/architecture/PROCESSOR-PROPOSAL.md' }
        ];

        docFiles.forEach(doc => {
            const sourcePath = path.join(this.pipelineDir, doc.from);
            if (fs.existsSync(sourcePath)) {
                const destPath = path.join(this.pipelineDir, doc.to);
                this.moveFile(sourcePath, destPath);
                this.log(`  ✅ Moved ${path.basename(doc.from)} to docs/`);
            }
        });

        migrations.forEach(migration => {
            const sourcePath = path.join(this.pipelineDir, migration.from);
            const destPath = path.join(this.pipelineDir, migration.to);
            
            if (fs.existsSync(sourcePath)) {
                if (migration.merge && fs.existsSync(destPath)) {
                    // Merge contents
                    this.mergeDirectories(sourcePath, destPath);
                    this.log(`  ✅ Merged ${migration.from} → ${migration.to}`);
                } else {
                    // Move directly
                    this.moveContent(sourcePath, destPath);
                    this.log(`  ✅ Moved ${migration.from} → ${migration.to}`);
                }
                this.migrationLog.push({
                    from: migration.from,
                    to: migration.to,
                    description: migration.description
                });
            }
        });
    }

    /**
     * Step 4: Update references in files
     */
    updateReferences() {
        this.log('\n🔧 Updating references in processors and agents...');

        const replacements = [
            // Update relative paths
            { from: /\.\.\/concept\//g, to: '../3-workspace/concept/' },
            { from: /\.\.\/prototype\//g, to: '../3-workspace/prototype/' },
            { from: /\.\.\/production\//g, to: '../3-workspace/production/' },
            { from: /\.\/factory\//g, to: './2-factory/' },
            { from: /\.\/requirements\//g, to: './1-inputs/requirements/' },
            { from: /\.\/config\//g, to: './1-inputs/config/' },
            { from: /\.\/runs\//g, to: './3-workspace/runs/' },
            // Update absolute pipeline paths
            { from: /\.pipeline\/concept\//g, to: '.pipeline/3-workspace/concept/' },
            { from: /\.pipeline\/prototype\//g, to: '.pipeline/3-workspace/prototype/' },
            { from: /\.pipeline\/production\//g, to: '.pipeline/3-workspace/production/' },
            { from: /\.pipeline\/requirements\//g, to: '.pipeline/1-inputs/requirements/' },
            { from: /\.pipeline\/config\//g, to: '.pipeline/1-inputs/config/' },
            { from: /\.pipeline\/factory\//g, to: '.pipeline/2-factory/' }
        ];

        // Find all JS and MD files to update
        const filesToCheck = [
            ...this.findFiles(path.join(this.pipelineDir, '2-factory'), '.js'),
            ...this.findFiles(path.join(this.pipelineDir, '2-factory'), '.md'),
            ...this.findFiles(path.join(this.pipelineDir, 'docs'), '.md')
        ];
        
        filesToCheck.forEach(file => {
            let content = fs.readFileSync(file, 'utf8');
            let updated = false;
            
            replacements.forEach(replacement => {
                if (replacement.from.test(content)) {
                    content = content.replace(replacement.from, replacement.to);
                    updated = true;
                }
            });
            
            if (updated) {
                fs.writeFileSync(file, content);
                this.updatedFiles.push(path.relative(this.pipelineDir, file));
                this.log(`  ✅ Updated ${path.basename(file)}`);
            }
        });
    }

    /**
     * Step 5: Clean up old directories
     */
    cleanup() {
        this.log('\n🧹 Cleaning up old structure...');

        const toDelete = [
            'staging',  // Redundant with workspace
            'factory/pipeline-output',  // Test output
            'factory/pipeline-run',     // Test output
            'factory/master-view-app',  // Test output
            'factory/production-app',   // Test output
            'factory/transformers/test-output',  // Test output
            'factory/transformers/components-output'  // Test output
        ];

        toDelete.forEach(dir => {
            const fullPath = path.join(this.pipelineDir, dir);
            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                this.log(`  ✅ Removed ${dir}/`);
            }
        });

        // Remove empty directories from old structure
        const oldDirs = ['concept', 'config', 'current', 'factory', 'graduated', 
                        'production', 'prototype', 'requirements', 'runs', 'specs', 'staging'];
        
        oldDirs.forEach(dir => {
            const fullPath = path.join(this.pipelineDir, dir);
            if (fs.existsSync(fullPath) && this.isDirectoryEmpty(fullPath)) {
                fs.rmdirSync(fullPath);
                this.log(`  ✅ Removed empty ${dir}/`);
            }
        });
    }

    /**
     * Step 6: Create migration log
     */
    createMigrationLog() {
        this.log('\n📝 Creating migration log...');

        const logContent = `# Pipeline Structure Migration Log

**Date**: ${new Date().toISOString()}
**Backup Location**: migration-backup-${this.timestamp}

## Summary

Successfully migrated from the old sprawling structure to a clean numbered (1-5) structure.

## New Structure

\`\`\`
.pipeline/
├── 1-inputs/          # Starting points (requirements, specs, config)
├── 2-factory/         # The machinery (agents, processors, validation)
├── 3-workspace/       # Active work in progress
├── 4-outputs/         # Completed, validated outputs
├── 5-archive/         # Historical runs
└── docs/              # Documentation
\`\`\`

## Key Features

1. **Sequential numbering** (1-5) shows the flow through the pipeline
2. **Clear separation** between inputs, machinery, work, and outputs
3. **Single workspace** for all active work (easy to clean)
4. **Validation folder** added to factory per Claude's suggestion
5. **Documentation** moved to dedicated docs/ folder

## Migrations Performed

| From | To | Description |
|------|-----|-------------|
${this.migrationLog
    .filter(m => m.from)
    .map(m => `| ${m.from} | ${m.to} | ${m.description || ''} |`)
    .join('\n')}

## Files Updated

${this.updatedFiles.length} files had their references updated:
${this.updatedFiles.map(f => `- ${f}`).join('\n')}

## Next Steps

1. Test all processors to ensure they work with new paths
2. Update any manual documentation that references old paths
3. Create initial requirements in 1-inputs/requirements/1.1.1-master-view/

## Rollback Instructions

If you need to rollback this migration:
1. Delete the new numbered directories (1-inputs, 2-factory, etc.)
2. Copy everything from migration-backup-${this.timestamp} back to .pipeline/
3. Remove MIGRATION-LOG.md

## Notes

- Added \`2-factory/validation/\` folder for validation processors
- Test outputs and temporary files were deleted (not migrated)
- Empty directories from old structure were removed
- All file references in JS/MD files were updated automatically
`;

        fs.writeFileSync(
            path.join(this.pipelineDir, 'MIGRATION-LOG.md'),
            logContent
        );
        
        this.log('✅ Migration log created: MIGRATION-LOG.md');
    }

    /**
     * Helper methods
     */
    copyRecursive(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    moveContent(src, dest) {
        // Ensure destination directory exists
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // If source is a directory and dest doesn't exist, rename it
        if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.renameSync(src, dest);
            } else {
                // Copy contents and remove source
                this.copyRecursive(src, dest);
                fs.rmSync(src, { recursive: true, force: true });
            }
        } else {
            // It's a file
            fs.renameSync(src, dest);
        }
    }

    moveFile(src, dest) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        if (fs.existsSync(src)) {
            fs.renameSync(src, dest);
        }
    }

    mergeDirectories(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.mergeDirectories(srcPath, destPath);
            } else {
                // Copy file if it doesn't exist in destination
                if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
        }
        
        // Remove source after merge
        fs.rmSync(src, { recursive: true, force: true });
    }

    isDirectoryEmpty(dir) {
        try {
            const files = fs.readdirSync(dir);
            return files.length === 0;
        } catch {
            return true;
        }
    }

    findFiles(dir, extension) {
        const results = [];
        
        function walk(currentDir) {
            if (!fs.existsSync(currentDir)) return;
            
            try {
                const files = fs.readdirSync(currentDir);
                
                for (const file of files) {
                    const filePath = path.join(currentDir, file);
                    const stat = fs.statSync(filePath);
                    
                    if (stat.isDirectory()) {
                        walk(filePath);
                    } else if (file.endsWith(extension)) {
                        results.push(filePath);
                    }
                }
            } catch (e) {
                // Skip directories we can't read
            }
        }
        
        walk(dir);
        return results;
    }

    /**
     * Main execution
     */
    async run() {
        console.log('🚀 Starting Pipeline Migration to Clean Structure\n');
        console.log('This will reorganize .pipeline/ into a numbered (1-5) structure');
        console.log('A backup will be created before any changes are made.\n');
        
        if (!fs.existsSync(this.pipelineDir)) {
            console.error('❌ Error: .pipeline directory not found!');
            console.error('Make sure you run this from the project root.');
            process.exit(1);
        }
        
        try {
            // Step 1: Backup
            this.createBackup();
            
            // Step 2: Create new structure
            this.createNewStructure();
            
            // Step 3: Migrate content
            this.migrateContent();
            
            // Step 4: Update references
            this.updateReferences();
            
            // Step 5: Cleanup
            this.cleanup();
            
            // Step 6: Create log
            this.createMigrationLog();
            
            console.log('\n✅ Migration completed successfully!');
            console.log(`📁 Backup saved at: .pipeline/migration-backup-${this.timestamp}`);
            console.log('📄 See .pipeline/MIGRATION-LOG.md for details');
            console.log('\n⚠️  Please test your processors to ensure they work with the new structure');
            
        } catch (error) {
            console.error('\n❌ Migration failed:', error.message);
            console.error('Stack trace:', error.stack);
            console.log('\n🔄 To rollback, restore from: migration-backup-${this.timestamp}');
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const migration = new PipelineMigration();
    migration.run();
}

module.exports = PipelineMigration;