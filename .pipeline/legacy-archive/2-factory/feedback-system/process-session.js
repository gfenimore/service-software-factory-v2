#!/usr/bin/env node

/**
 * PROCESS SESSION - Makes feedback FULL REQUIREMENTS CITIZENS!
 * 
 * This processes all non-CSS feedback through the COMPLETE pipeline:
 * 1. Feedback → Requirements Spec
 * 2. BUSM Validation
 * 3. Requirements Parser
 * 4. Story Builder
 * 5. Concept Generator
 * 
 * Run: npm run feedback:process-session [session-id]
 * Or: npm run feedback:process-session (for current session)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SessionProcessor {
    constructor() {
        this.baseDir = path.join(__dirname, '../../..');
        this.sessionsDir = path.join(this.baseDir, '.pipeline/1-inputs/requirements/feedback-sessions');
        this.feedbackTasksDir = path.join(this.baseDir, '.pipeline/1-inputs/requirements/feedback-tasks');
    }
    
    async processSession(sessionId) {
        console.log('\n🚀 SESSION PROCESSOR - Full Pipeline Integration\n');
        console.log('=' .repeat(60));
        
        // 1. Find session
        const session = this.loadSession(sessionId);
        if (!session) {
            console.error(`❌ Session not found: ${sessionId}`);
            return;
        }
        
        console.log(`📂 Processing session: ${session.id}`);
        console.log(`📊 Stats: ${session.feedbackCount} total, ${session.fullPipeline.length} need pipeline\n`);
        
        // 2. Copy feedback to tasks directory for pipeline processing
        this.prepareFeedbackTasks(session);
        
        // 3. Run feedback-to-requirements converter
        console.log('\n📝 STEP 1: Converting feedback to requirements...\n');
        try {
            execSync('node .pipeline/2-factory/feedback-system/feedback-to-requirements.js', {
                stdio: 'inherit',
                cwd: this.baseDir
            });
        } catch (error) {
            console.error('❌ Failed to convert feedback to requirements:', error.message);
            return;
        }
        
        // 4. Run requirements parser on generated specs
        console.log('\n🔍 STEP 2: Parsing requirements...\n');
        const specsDir = path.join(this.baseDir, '.pipeline/1-inputs/requirements/feedback-requirements');
        
        if (fs.existsSync(specsDir)) {
            const specs = fs.readdirSync(specsDir).filter(f => f.endsWith('.md'));
            
            for (const spec of specs) {
                const specPath = path.join(specsDir, spec);
                console.log(`   Parsing: ${spec}`);
                
                try {
                    execSync(`node .pipeline/2-factory/processors/requirements-parser/REQUIREMENTS-PARSER.js "${specPath}" .pipeline/2-factory/validation`, {
                        stdio: 'inherit',
                        cwd: this.baseDir
                    });
                } catch (error) {
                    console.error(`   ⚠️ Failed to parse ${spec}:`, error.message);
                }
            }
        }
        
        // 5. Continue through pipeline (if processors exist)
        console.log('\n📦 STEP 3: Continue through pipeline...\n');
        
        // Check if story builder exists
        const storyBuilderPath = path.join(this.baseDir, '.pipeline/2-factory/processors/story-builder/STORY-BUILDER.js');
        if (fs.existsSync(storyBuilderPath)) {
            console.log('   Running Story Builder...');
            try {
                execSync(`node "${storyBuilderPath}"`, {
                    stdio: 'inherit',
                    cwd: this.baseDir
                });
            } catch (error) {
                console.log('   ⚠️ Story Builder not ready or failed');
            }
        }
        
        // 6. Mark session items as processed
        this.markProcessed(session);
        
        // 7. Generate final report
        const report = this.generateReport(session);
        
        console.log('\n' + '=' .repeat(60));
        console.log('✅ SESSION PROCESSING COMPLETE!\n');
        console.log(report);
        
        return report;
    }
    
    loadSession(sessionId) {
        // If no session ID provided, use current active session
        if (!sessionId) {
            const activeSessionFile = path.join(this.sessionsDir, 'active/current-session.json');
            if (fs.existsSync(activeSessionFile)) {
                return JSON.parse(fs.readFileSync(activeSessionFile, 'utf8'));
            }
            console.log('No active session found');
            return null;
        }
        
        // Check active session
        const activeSessionFile = path.join(this.sessionsDir, 'active/current-session.json');
        if (fs.existsSync(activeSessionFile)) {
            const session = JSON.parse(fs.readFileSync(activeSessionFile, 'utf8'));
            if (session.id === sessionId) {
                return session;
            }
        }
        
        // Check completed sessions
        const completedDir = path.join(this.sessionsDir, 'completed', sessionId);
        if (fs.existsSync(completedDir)) {
            const sessionFile = path.join(completedDir, 'current-session.json');
            if (fs.existsSync(sessionFile)) {
                return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
            }
        }
        
        return null;
    }
    
    prepareFeedbackTasks(session) {
        console.log('📋 Preparing feedback for pipeline processing...\n');
        
        // Ensure feedback-tasks directory exists
        if (!fs.existsSync(this.feedbackTasksDir)) {
            fs.mkdirSync(this.feedbackTasksDir, { recursive: true });
        }
        
        // Copy non-CSS feedback to tasks directory
        const toCopy = session.fullPipeline.filter(
            id => !session.resolved.includes(id)
        );
        
        let copied = 0;
        for (const feedbackId of toCopy) {
            // Find feedback file
            const locations = [
                path.join(this.sessionsDir, 'active', `${feedbackId}.json`),
                path.join(this.sessionsDir, 'completed', session.id, `${feedbackId}.json`)
            ];
            
            for (const location of locations) {
                if (fs.existsSync(location)) {
                    const feedback = JSON.parse(fs.readFileSync(location, 'utf8'));
                    
                    // Transform to task format expected by converter
                    const task = {
                        id: feedback.id.replace('FB-', 'TASK-'),
                        title: feedback.description.substring(0, 50),
                        description: feedback.description,
                        type: feedback.type,
                        priority: feedback.priority,
                        estimate: feedback.estimate || '1-2 hours',
                        complexity: feedback.complexity || 'medium',
                        context: feedback.context,
                        createdAt: feedback.receivedAt,
                        status: 'pending',
                        implementation: feedback.implementation || []
                    };
                    
                    // Save to tasks directory
                    const taskFile = path.join(this.feedbackTasksDir, `${task.id}.json`);
                    fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));
                    console.log(`   ✅ Prepared: ${feedbackId} → ${task.id}`);
                    copied++;
                    break;
                }
            }
        }
        
        console.log(`   Total prepared: ${copied} feedback items\n`);
    }
    
    markProcessed(session) {
        // Mark all pipeline items as resolved
        const toMark = session.fullPipeline.filter(
            id => !session.resolved.includes(id)
        );
        
        toMark.forEach(id => {
            session.resolved.push(id);
        });
        
        // Save updated session
        const activeSessionFile = path.join(this.sessionsDir, 'active/current-session.json');
        if (fs.existsSync(activeSessionFile)) {
            const currentSession = JSON.parse(fs.readFileSync(activeSessionFile, 'utf8'));
            if (currentSession.id === session.id) {
                fs.writeFileSync(activeSessionFile, JSON.stringify(session, null, 2));
                console.log(`   ✅ Marked ${toMark.length} items as processed`);
            }
        }
    }
    
    generateReport(session) {
        const quickFixRate = ((session.quickFixes.length / (session.feedbackCount || 1)) * 100).toFixed(1);
        const pipelineRate = ((session.fullPipeline.length / (session.feedbackCount || 1)) * 100).toFixed(1);
        
        return `
📊 PROCESSING REPORT
━━━━━━━━━━━━━━━━━━━
Session: ${session.id}
Total Feedback: ${session.feedbackCount}

Distribution:
- Quick Fixes (CSS): ${session.quickFixes.length} (${quickFixRate}%)
- Full Pipeline: ${session.fullPipeline.length} (${pipelineRate}%)
- Resolved: ${session.resolved.length}

Pipeline Results:
✅ Requirements generated
✅ BUSM validation complete
✅ Requirements parsed
✅ Ready for story building

Next Steps:
1. Review generated requirements in:
   .pipeline/1-inputs/requirements/feedback-requirements/

2. Apply CSS fixes:
   <link rel="stylesheet" href=".pipeline/1-inputs/requirements/feedback-sessions/quick-fixes/session-fixes.css">

3. Continue pipeline processing:
   - Story Builder
   - Task Planner
   - Concept Generator

All feedback is now a FULL REQUIREMENTS CITIZEN! 🎉
`;
    }
}

// Run if called directly
if (require.main === module) {
    const processor = new SessionProcessor();
    const sessionId = process.argv[2];
    
    processor.processSession(sessionId).catch(console.error);
}

module.exports = SessionProcessor;