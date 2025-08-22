#!/usr/bin/env node

/**
 * Feedback to Tasks Processor
 * Converts feedback items into actionable tasks
 */

const fs = require('fs');
const path = require('path');

function processFeedback(feedbackFile) {
    console.log('📝 Processing feedback...\n');
    
    // Read feedback file
    const feedback = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
    
    // Group feedback by type
    const grouped = {
        ui: [],
        enhancement: [],
        feature: [],
        bug: [],
        validation: [],
        data: [],
        performance: []
    };
    
    feedback.forEach(item => {
        if (grouped[item.type]) {
            grouped[item.type].push(item);
        }
    });
    
    // Generate tasks
    const tasks = [];
    
    // Process each feedback item
    feedback.forEach((item, index) => {
        const task = {
            id: `TASK-FB-${index + 1}`,
            source: item.id,
            title: generateTaskTitle(item),
            description: item.description,
            expectedBehavior: item.expectedBehavior,
            component: item.component,
            priority: item.priority,
            type: item.type,
            context: item.context,
            implementation: generateImplementation(item)
        };
        
        tasks.push(task);
        
        console.log(`✅ Created ${task.id}: ${task.title}`);
        console.log(`   Type: ${item.type} | Priority: ${item.priority}`);
        console.log(`   Component: ${item.component || 'General'}\n`);
    });
    
    return tasks;
}

function generateTaskTitle(feedback) {
    const typePrefix = {
        ui: 'UI Enhancement',
        enhancement: 'Enhancement',
        feature: 'New Feature',
        bug: 'Bug Fix',
        validation: 'Validation',
        data: 'Data Fix',
        performance: 'Performance'
    };
    
    const prefix = typePrefix[feedback.type] || 'Task';
    const shortDesc = feedback.description.substring(0, 50).replace(/\n/g, ' ');
    
    return `${prefix}: ${shortDesc}${feedback.description.length > 50 ? '...' : ''}`;
}

function generateImplementation(feedback) {
    const steps = [];
    
    // Based on feedback type, suggest implementation steps
    switch(feedback.type) {
        case 'ui':
            steps.push('1. Locate the component in the HTML');
            steps.push('2. Update CSS styles or HTML structure');
            steps.push('3. Test visual changes across screen sizes');
            break;
            
        case 'enhancement':
            steps.push('1. Identify the current implementation');
            steps.push('2. Add the enhanced functionality');
            steps.push('3. Update any related components');
            steps.push('4. Test the enhancement');
            break;
            
        case 'feature':
            steps.push('1. Design the new feature structure');
            steps.push('2. Implement the feature logic');
            steps.push('3. Add UI components');
            steps.push('4. Integrate with existing code');
            steps.push('5. Add validation and error handling');
            break;
            
        case 'bug':
            steps.push('1. Reproduce the issue');
            steps.push('2. Identify root cause');
            steps.push('3. Implement fix');
            steps.push('4. Test fix thoroughly');
            break;
            
        case 'validation':
            steps.push('1. Review the requirement');
            steps.push('2. Check current implementation');
            steps.push('3. Update to meet requirement');
            steps.push('4. Add validation test');
            break;
            
        default:
            steps.push('1. Analyze the feedback');
            steps.push('2. Implement changes');
            steps.push('3. Test implementation');
    }
    
    // Add context-specific steps
    if (feedback.context?.appState?.selectedAccount) {
        steps.push(`Context: User was viewing ${feedback.context.appState.selectedAccount}`);
    }
    
    return steps;
}

function generateTaskFile(tasks, outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `feedback-tasks-${timestamp}.md`;
    const filepath = path.join(outputDir, filename);
    
    let content = `# Feedback-Generated Tasks
Generated: ${new Date().toISOString()}
Source: User Feedback from Concept Testing

## Summary
Total Tasks: ${tasks.length}
- High Priority: ${tasks.filter(t => t.priority === 'high').length}
- Medium Priority: ${tasks.filter(t => t.priority === 'medium').length}
- Low Priority: ${tasks.filter(t => t.priority === 'low').length}

---

## Tasks

`;

    tasks.forEach(task => {
        content += `### ${task.id}: ${task.title}

**Priority**: ${task.priority}
**Type**: ${task.type}
**Component**: ${task.component || 'General'}
**Feedback ID**: ${task.source}

#### Description
${task.description}

${task.expectedBehavior ? `#### Expected Behavior
${task.expectedBehavior}

` : ''}#### Implementation Steps
${task.implementation.map(step => `- ${step}`).join('\n')}

${task.context ? `#### Context
- Selected Account: ${task.context.appState?.selectedAccount || 'None'}
- Selected Location: ${task.context.appState?.selectedLocation || 'None'}
- Visible Items: ${task.context.appState?.visibleItems?.accounts || 0} accounts, ${task.context.appState?.visibleItems?.locations || 0} locations

` : ''}---

`;
    });
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filepath, content);
    
    return filepath;
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node FEEDBACK-TO-TASKS.js <feedback.json> [output-dir]');
        console.log('Example: node FEEDBACK-TO-TASKS.js ./feedback-2025-01-19.json ./tasks');
        process.exit(1);
    }
    
    const feedbackFile = args[0];
    const outputDir = args[1] || '.pipeline/1-inputs/requirements/1.1.1-master-view/artifacts/tasks';
    
    if (!fs.existsSync(feedbackFile)) {
        console.error(`❌ Feedback file not found: ${feedbackFile}`);
        process.exit(1);
    }
    
    console.log('🔄 Feedback to Tasks Processor\n');
    console.log(`📂 Input: ${feedbackFile}`);
    console.log(`📂 Output: ${outputDir}\n`);
    
    try {
        const tasks = processFeedback(feedbackFile);
        const outputFile = generateTaskFile(tasks, outputDir);
        
        console.log('='.repeat(60));
        console.log(`✅ Successfully generated ${tasks.length} tasks`);
        console.log(`📁 Output file: ${outputFile}`);
        console.log('\n🚀 Next steps:');
        console.log('  1. Review generated tasks');
        console.log('  2. Run Concept Generator to implement changes');
        console.log('  3. Test in browser');
    } catch (error) {
        console.error('❌ Error processing feedback:', error);
        process.exit(1);
    }
}

module.exports = { processFeedback, generateTaskFile };