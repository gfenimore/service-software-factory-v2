#!/usr/bin/env node

/**
 * PROCESS BROWSER FEEDBACK
 * 
 * This script processes feedback that was collected in the browser
 * and saved to localStorage. Users can export their feedback and
 * this script will process it into tasks.
 * 
 * Usage:
 * 1. In browser console: copy(localStorage.getItem('feedbackTasks'))
 * 2. Save to a file: feedback-export.json
 * 3. Run: node process-browser-feedback.js feedback-export.json
 */

const fs = require('fs');
const path = require('path');

class BrowserFeedbackProcessor {
    constructor() {
        this.pipelineRoot = path.join(__dirname, '../../');
        this.tasksDir = path.join(this.pipelineRoot, '1-inputs/requirements/feedback-tasks');
        this.processedTasks = [];
    }

    processExport(exportFile) {
        console.log('\n🔄 PROCESSING BROWSER FEEDBACK\n');
        console.log('=' .repeat(50));
        
        // Read the export file
        let tasks;
        try {
            const content = fs.readFileSync(exportFile, 'utf8');
            tasks = JSON.parse(content);
            
            // Handle both array and wrapped exports
            if (!Array.isArray(tasks)) {
                if (tasks.tasks && Array.isArray(tasks.tasks)) {
                    tasks = tasks.tasks;
                } else {
                    console.error('❌ Invalid export format. Expected an array of tasks.');
                    return;
                }
            }
        } catch (error) {
            console.error(`❌ Error reading export file: ${error.message}`);
            return;
        }
        
        console.log(`📋 Found ${tasks.length} feedback tasks to process\n`);
        
        // Ensure tasks directory exists
        if (!fs.existsSync(this.tasksDir)) {
            fs.mkdirSync(this.tasksDir, { recursive: true });
            console.log(`📁 Created tasks directory: ${this.tasksDir}\n`);
        }
        
        // Process each task
        tasks.forEach((task, index) => {
            console.log(`\nProcessing task ${index + 1}/${tasks.length}: ${task.title || task.id}`);
            this.processTask(task);
        });
        
        // Generate summary report
        this.generateSummary();
        
        console.log('\n' + '=' .repeat(50));
        console.log('✅ FEEDBACK PROCESSING COMPLETE!\n');
        console.log(`📊 Summary:`);
        console.log(`   - Tasks processed: ${this.processedTasks.length}`);
        console.log(`   - Location: ${this.tasksDir}`);
        console.log(`\n🎯 Next steps:`);
        console.log(`   1. Run: npm run feedback:implement`);
        console.log(`   2. Review the generated tasks`);
        console.log(`   3. Implement the changes\n`);
    }

    processTask(task) {
        // Enhance task with additional metadata
        const enhancedTask = {
            ...task,
            processedAt: new Date().toISOString(),
            source: 'browser-feedback',
            implementation: task.implementation || this.generateImplementation(task),
            acceptance: this.generateAcceptanceCriteria(task)
        };
        
        // Save task to file
        const filename = `${task.id || `TASK-${Date.now()}`}.json`;
        const filepath = path.join(this.tasksDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(enhancedTask, null, 2));
        console.log(`   ✅ Saved: ${filename}`);
        
        this.processedTasks.push({
            file: filename,
            task: enhancedTask
        });
    }

    generateImplementation(task) {
        // Default implementation steps based on type
        const implementations = {
            ui: {
                steps: [
                    'Identify the component in the codebase',
                    'Update styles or markup',
                    'Test responsive behavior',
                    'Verify accessibility'
                ],
                files: ['components/', 'styles/'],
                estimate: '30 minutes'
            },
            feature: {
                steps: [
                    'Create feature specification',
                    'Design data model',
                    'Implement backend logic',
                    'Build UI components',
                    'Add tests',
                    'Update documentation'
                ],
                files: ['src/', 'api/', 'tests/'],
                estimate: '4-8 hours'
            },
            enhancement: {
                steps: [
                    'Review current implementation',
                    'Design improvement',
                    'Update code',
                    'Test changes'
                ],
                files: ['src/'],
                estimate: '1-2 hours'
            },
            bug: {
                steps: [
                    'Reproduce the issue',
                    'Debug and find root cause',
                    'Implement fix',
                    'Add regression test'
                ],
                files: ['src/', 'tests/'],
                estimate: '1 hour'
            }
        };
        
        return implementations[task.type] || implementations.enhancement;
    }

    generateAcceptanceCriteria(task) {
        const criteria = [];
        
        // Type-specific criteria
        switch(task.type) {
            case 'ui':
                criteria.push('Visual changes match the description');
                criteria.push('Responsive on mobile, tablet, desktop');
                criteria.push('Cross-browser compatible');
                criteria.push('Accessible (WCAG 2.1 AA)');
                break;
            case 'feature':
                criteria.push('Feature works as described');
                criteria.push('Edge cases handled');
                criteria.push('Error states implemented');
                criteria.push('Tests pass');
                criteria.push('Documentation updated');
                break;
            case 'bug':
                criteria.push('Issue no longer reproducible');
                criteria.push('No regression in related features');
                criteria.push('Test added to prevent recurrence');
                break;
            default:
                criteria.push('Implementation matches description');
                criteria.push('No breaking changes');
                criteria.push('Tests pass');
        }
        
        return criteria;
    }

    generateSummary() {
        const summaryPath = path.join(this.tasksDir, 'FEEDBACK-SUMMARY.md');
        
        let summary = `# Feedback Tasks Summary
Generated: ${new Date().toISOString()}

## Overview
- Total Tasks: ${this.processedTasks.length}
- Source: Browser Feedback Collection

## Tasks by Type
`;
        
        // Group by type
        const byType = {};
        this.processedTasks.forEach(item => {
            const type = item.task.type || 'other';
            if (!byType[type]) byType[type] = [];
            byType[type].push(item);
        });
        
        Object.entries(byType).forEach(([type, items]) => {
            summary += `\n### ${type.toUpperCase()} (${items.length})\n`;
            items.forEach(item => {
                summary += `- **${item.task.id}**: ${item.task.title || item.task.description.substring(0, 50)}\n`;
                summary += `  - Priority: ${item.task.priority}\n`;
                summary += `  - Estimate: ${item.task.estimate || 'TBD'}\n`;
            });
        });
        
        summary += `\n## Next Steps
1. Run \`npm run feedback:implement\` to implement these tasks
2. Review generated changes
3. Test in browser
4. Submit more feedback!
`;
        
        fs.writeFileSync(summaryPath, summary);
        console.log(`\n📄 Summary saved: FEEDBACK-SUMMARY.md`);
    }
}

// Interactive mode
async function interactiveMode() {
    const processor = new BrowserFeedbackProcessor();
    
    console.log('\n💡 BROWSER FEEDBACK PROCESSOR\n');
    console.log('This tool processes feedback exported from the browser.\n');
    console.log('To export feedback from browser:');
    console.log('1. Open browser console (F12)');
    console.log('2. Run: copy(localStorage.getItem("feedbackTasks"))');
    console.log('3. Paste into a file and save');
    console.log('4. Run this script with the file path\n');
    
    // Check for command line argument
    const exportFile = process.argv[2];
    
    if (exportFile) {
        processor.processExport(exportFile);
    } else {
        // Try to find default export
        const defaultPath = path.join(process.cwd(), 'feedback-export.json');
        if (fs.existsSync(defaultPath)) {
            console.log(`📂 Found feedback-export.json, processing...`);
            processor.processExport(defaultPath);
        } else {
            console.log('Usage: node process-browser-feedback.js <export-file>');
            console.log('   or: Save export as feedback-export.json in current directory');
        }
    }
}

// Run if called directly
if (require.main === module) {
    interactiveMode().catch(console.error);
}

module.exports = BrowserFeedbackProcessor;