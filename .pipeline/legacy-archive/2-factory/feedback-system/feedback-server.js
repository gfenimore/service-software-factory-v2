#!/usr/bin/env node

/**
 * SIMPLE FEEDBACK SERVER - Phase 1 Demo Acceleration
 * 
 * Eliminates ALL manual steps without needing Supabase!
 * Just a simple Express server that:
 * 1. Receives feedback from browser
 * 2. Saves to file system
 * 3. Groups by session
 * 4. Processes automatically
 * 
 * Run: npm run feedback:server
 * Then your HTML feedback button POSTs here instead of localStorage!
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3456; // Feedback port

// Middleware
app.use(cors());
app.use(express.json());

class FeedbackServer {
    constructor() {
        this.baseDir = path.join(__dirname, '../../..');
        this.sessionsDir = path.join(this.baseDir, '.pipeline/1-inputs/requirements/feedback-sessions');
        this.currentSession = null;
        
        // Ensure directories exist
        this.ensureDirectories();
        
        // Start or resume session
        this.initSession();
    }
    
    ensureDirectories() {
        const dirs = [
            this.sessionsDir,
            path.join(this.sessionsDir, 'active'),
            path.join(this.sessionsDir, 'completed'),
            path.join(this.sessionsDir, 'quick-fixes')
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    initSession() {
        // Check for active session
        const activeSessionFile = path.join(this.sessionsDir, 'active/current-session.json');
        
        if (fs.existsSync(activeSessionFile)) {
            this.currentSession = JSON.parse(fs.readFileSync(activeSessionFile, 'utf8'));
            console.log(`📂 Resumed session: ${this.currentSession.id}`);
        } else {
            // Create new session
            this.currentSession = {
                id: `demo-${new Date().toISOString().split('T')[0]}-${Date.now().toString(36)}`,
                startedAt: new Date().toISOString(),
                feedbackCount: 0,
                quickFixes: [],
                fullPipeline: [],
                resolved: []
            };
            this.saveSession();
            console.log(`🆕 Started new session: ${this.currentSession.id}`);
        }
    }
    
    saveSession() {
        const sessionFile = path.join(this.sessionsDir, 'active/current-session.json');
        fs.writeFileSync(sessionFile, JSON.stringify(this.currentSession, null, 2));
    }
    
    async receiveFeedback(feedbackData) {
        console.log(`\n📥 Feedback received: ${feedbackData.description.substring(0, 50)}...`);
        
        // Add to current session
        this.currentSession.feedbackCount++;
        
        // Determine if this is a quick fix (CSS only)
        const isQuickFix = this.isQuickFix(feedbackData);
        
        // Create feedback record
        const feedback = {
            id: `FB-${this.currentSession.id}-${this.currentSession.feedbackCount}`,
            sessionId: this.currentSession.id,
            ...feedbackData,
            receivedAt: new Date().toISOString(),
            isQuickFix,
            status: 'pending'
        };
        
        // Save feedback to session directory
        const feedbackFile = path.join(
            this.sessionsDir, 
            'active', 
            `${feedback.id}.json`
        );
        fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
        
        // Add to appropriate queue
        if (isQuickFix) {
            this.currentSession.quickFixes.push(feedback.id);
            console.log(`⚡ Added to quick-fix queue (CSS only)`);
            
            // Process immediately if CSS-only
            this.processQuickFix(feedback);
        } else {
            this.currentSession.fullPipeline.push(feedback.id);
            console.log(`📦 Added to full pipeline queue`);
        }
        
        this.saveSession();
        
        // Return processing info
        return {
            success: true,
            feedbackId: feedback.id,
            sessionId: this.currentSession.id,
            isQuickFix,
            message: isQuickFix ? 
                'CSS fix will be applied immediately!' : 
                'Feedback queued for requirements processing',
            sessionStats: {
                total: this.currentSession.feedbackCount,
                quickFixes: this.currentSession.quickFixes.length,
                fullPipeline: this.currentSession.fullPipeline.length,
                resolved: this.currentSession.resolved.length
            }
        };
    }
    
    isQuickFix(feedback) {
        // Detect if this is a CSS-only change
        const cssKeywords = [
            'color', 'background', 'font', 'size', 'padding', 'margin',
            'border', 'shadow', 'spacing', 'align', 'width', 'height',
            'visible', 'hidden', 'opacity', 'bold', 'italic', 'underline',
            'darker', 'lighter', 'bigger', 'smaller', 'move', 'position'
        ];
        
        const description = feedback.description.toLowerCase();
        const isCssType = feedback.type === 'ui';
        const hasCssKeyword = cssKeywords.some(keyword => description.includes(keyword));
        const isSimple = feedback.complexity === 'low' || !description.includes('add');
        
        return isCssType && hasCssKeyword && isSimple;
    }
    
    processQuickFix(feedback) {
        console.log(`\n⚡ QUICK FIX PROCESSOR`);
        console.log(`Processing: ${feedback.description}`);
        
        // Generate CSS based on description
        const css = this.generateQuickCSS(feedback);
        
        // Save to quick-fixes directory
        const cssFile = path.join(this.sessionsDir, 'quick-fixes', `${feedback.id}.css`);
        fs.writeFileSync(cssFile, css);
        
        // Append to master quick-fix file
        const masterCSS = path.join(this.sessionsDir, 'quick-fixes', 'session-fixes.css');
        fs.appendFileSync(masterCSS, `\n/* ${feedback.id} */\n${css}\n`);
        
        // Mark as resolved
        feedback.status = 'resolved';
        feedback.resolution = {
            type: 'quick-fix',
            cssFile: cssFile,
            appliedAt: new Date().toISOString()
        };
        
        this.currentSession.resolved.push(feedback.id);
        this.saveSession();
        
        console.log(`✅ Quick fix applied! CSS saved to: ${cssFile}`);
        
        return css;
    }
    
    generateQuickCSS(feedback) {
        // Smart CSS generation based on feedback
        const description = feedback.description.toLowerCase();
        let css = '';
        
        // Determine selector based on context
        const selector = feedback.context?.selectedAccount ? 
            '.card.selected' : '.card';
        
        // Parse description for CSS properties
        if (description.includes('darker')) {
            css += `${selector} {
    background-color: #0066cc !important;
    color: white !important;
}`;
        }
        
        if (description.includes('bigger') || description.includes('larger')) {
            css += `${selector} {
    font-size: 1.2em !important;
    padding: 20px !important;
}`;
        }
        
        if (description.includes('shadow')) {
            css += `${selector} {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}`;
        }
        
        if (description.includes('spacing') || description.includes('space')) {
            css += `${selector} {
    margin: 15px !important;
    padding: 20px !important;
}`;
        }
        
        // Default if no specific match
        if (!css) {
            css = `/* TODO: Manual CSS needed for: ${feedback.description} */
${selector} {
    /* Add your CSS here */
}`;
        }
        
        return css;
    }
    
    // Session management endpoints
    getSessionStatus() {
        return {
            session: this.currentSession,
            stats: {
                total: this.currentSession.feedbackCount,
                pending: this.currentSession.quickFixes.length + this.currentSession.fullPipeline.length - this.currentSession.resolved.length,
                resolved: this.currentSession.resolved.length,
                quickFixRate: this.currentSession.quickFixes.length / (this.currentSession.feedbackCount || 1)
            }
        };
    }
    
    processFullPipeline() {
        console.log(`\n🔄 Processing full pipeline items...`);
        
        const pending = this.currentSession.fullPipeline.filter(
            id => !this.currentSession.resolved.includes(id)
        );
        
        if (pending.length === 0) {
            console.log('No pending items to process');
            return { processed: 0 };
        }
        
        // Run the FULL requirements pipeline!
        const { execSync } = require('child_process');
        
        try {
            console.log(`\n🚀 Running feedback through FULL PIPELINE...`);
            console.log(`   Processing ${pending.length} items as requirements\n`);
            
            // Run the session processor which handles the full pipeline
            execSync(`node ${path.join(__dirname, 'process-session.js')} ${this.currentSession.id}`, {
                stdio: 'inherit',
                cwd: path.join(__dirname, '../../..')
            });
            
            // Mark as processed
            pending.forEach(id => {
                this.currentSession.resolved.push(id);
            });
            
            console.log(`\n✅ All feedback processed as FULL REQUIREMENTS CITIZENS!`);
        } catch (error) {
            console.error(`❌ Pipeline processing failed:`, error.message);
            console.log(`   You can run manually: npm run feedback:process-session ${this.currentSession.id}`);
        }
        
        this.saveSession();
        
        return { processed: pending.length };
    }
    
    completeSession() {
        // Move session to completed
        const completedDir = path.join(this.sessionsDir, 'completed', this.currentSession.id);
        const activeDir = path.join(this.sessionsDir, 'active');
        
        // Create completed session directory
        if (!fs.existsSync(completedDir)) {
            fs.mkdirSync(completedDir, { recursive: true });
        }
        
        // Move all files
        const files = fs.readdirSync(activeDir);
        files.forEach(file => {
            const src = path.join(activeDir, file);
            const dest = path.join(completedDir, file);
            fs.renameSync(src, dest);
        });
        
        // Generate session report
        const report = this.generateSessionReport();
        fs.writeFileSync(
            path.join(completedDir, 'session-report.md'),
            report
        );
        
        console.log(`\n✅ Session completed: ${this.currentSession.id}`);
        console.log(`📄 Report saved to: ${completedDir}/session-report.md`);
        
        // Start new session
        this.currentSession = null;
        this.initSession();
        
        return { report };
    }
    
    generateSessionReport() {
        const duration = new Date() - new Date(this.currentSession.startedAt);
        const minutes = Math.round(duration / 60000);
        
        return `# Demo Session Report: ${this.currentSession.id}

## Summary
- **Duration**: ${minutes} minutes
- **Total Feedback**: ${this.currentSession.feedbackCount}
- **Quick Fixes**: ${this.currentSession.quickFixes.length}
- **Full Pipeline**: ${this.currentSession.fullPipeline.length}
- **Resolved**: ${this.currentSession.resolved.length}

## Quick Fix Rate
${((this.currentSession.quickFixes.length / (this.currentSession.feedbackCount || 1)) * 100).toFixed(1)}% of feedback was handled as quick CSS fixes

## Next Steps
1. Apply CSS fixes: \`<link rel="stylesheet" href="session-fixes.css">\`
2. Process pipeline items: \`npm run feedback:process-session ${this.currentSession.id}\`
3. Review unresolved items

## Files Generated
- Quick fixes: ${this.currentSession.quickFixes.length} CSS files
- Pipeline items: ${this.currentSession.fullPipeline.length} requirement specs
- Session data: ${this.currentSession.feedbackCount} JSON files

---
Generated: ${new Date().toISOString()}
`;
    }
}

// Initialize server
const feedbackServer = new FeedbackServer();

// Routes
app.post('/feedback', async (req, res) => {
    const result = await feedbackServer.receiveFeedback(req.body);
    res.json(result);
});

app.get('/session', (req, res) => {
    res.json(feedbackServer.getSessionStatus());
});

app.post('/session/process', (req, res) => {
    const result = feedbackServer.processFullPipeline();
    res.json(result);
});

app.post('/session/complete', (req, res) => {
    const result = feedbackServer.completeSession();
    res.json(result);
});

app.get('/health', (req, res) => {
    res.json({ status: 'running', session: feedbackServer.currentSession?.id });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 FEEDBACK SERVER RUNNING!
================================
📡 Endpoint: http://localhost:${PORT}/feedback
📂 Session: ${feedbackServer.currentSession.id}
⚡ Quick fixes: Processed immediately
📦 Complex items: Queued for pipeline

Status: http://localhost:${PORT}/session
Health: http://localhost:${PORT}/health

Ready to receive feedback!
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down feedback server...');
    feedbackServer.completeSession();
    process.exit(0);
});