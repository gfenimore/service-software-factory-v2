/**
 * SUB-MODULE AWARE FEEDBACK FRAMEWORK
 * Automatically adapts to any sub-module's interface contract
 * Version: 1.0 - CONCEPT LINE
 */

class SubModuleFeedbackCapture {
    constructor(subModuleId, subModuleName) {
        this.subModuleId = subModuleId;  // e.g., "1.1.1"
        this.subModuleName = subModuleName;  // e.g., "Master View"
        this.feedback = {
            subModule: {
                id: subModuleId,
                name: subModuleName,
                timestamp: new Date().toISOString()
            },
            interactions: [],
            painPoints: [],
            featureVotes: {},
            scopeDecisions: {
                mustHave: [],
                niceToHave: [],
                outOfScope: [],
                unsure: []
            },
            workflows: [],
            timeTracking: {},
            sentiment: []
        };
        
        this.startTime = Date.now();
        this.interactionCount = 0;
    }
    
    // Initialize feedback UI based on sub-module type
    init() {
        console.log(`🎯 Feedback Framework activated for ${this.subModuleId} - ${this.subModuleName}`);
        
        // Add the feedback UI
        this.addFeedbackPanel();
        this.addPainPointCapture();
        this.addScopeButtons();
        this.trackInteractions();
        this.addKeyboardShortcuts();
        
        // Sub-module specific initialization
        this.initSubModuleSpecific();
    }
    
    // Adapt to different sub-module patterns
    initSubModuleSpecific() {
        const patterns = {
            '1.1.1': this.initMasterViewFeedback.bind(this),
            '1.1.2': this.initDetailViewFeedback.bind(this),
            '1.2.1': this.initWorkOrderFeedback.bind(this)
        };
        
        const initFn = patterns[this.subModuleId];
        if (initFn) {
            initFn();
        }
    }
    
    // Master View specific feedback
    initMasterViewFeedback() {
        // Track column interactions
        ['accounts', 'locations', 'workorders'].forEach(column => {
            const element = document.getElementById(`${column}-column`);
            if (element) {
                this.addColumnFeedback(element, column);
            }
        });
        
        // Track navigation flow
        this.trackNavigationFlow();
    }
    
    // Detail View specific feedback  
    initDetailViewFeedback() {
        // Track form interactions
        this.trackFormUsage();
        // Track save/cancel patterns
        this.trackModalPatterns();
    }
    
    // Work Order specific feedback
    initWorkOrderFeedback() {
        // Track status changes
        this.trackStatusWorkflow();
        // Track scheduling patterns
        this.trackSchedulingInteractions();
    }
    
    // Core feedback panel
    addFeedbackPanel() {
        const panel = document.createElement('div');
        panel.id = 'feedback-panel';
        panel.innerHTML = `
            <div style="position: fixed; top: 10px; left: 10px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px; z-index: 10000; font-family: system-ui; max-width: 250px;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #92400e;">
                    📊 Stakeholder Feedback Mode
                </div>
                <div style="font-size: 12px; color: #78350f; margin-bottom: 8px;">
                    Sub-Module: ${this.subModuleId} ${this.subModuleName}
                </div>
                
                <div style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #fbbf24;">
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px;">Quick Feedback:</div>
                    <button onclick="feedbackCapture.quickVote('love')" style="margin: 2px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 11px;">😍 Love it</button>
                    <button onclick="feedbackCapture.quickVote('works')" style="margin: 2px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 11px;">👍 Works</button>
                    <button onclick="feedbackCapture.quickVote('confused')" style="margin: 2px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 11px;">😕 Confused</button>
                    <button onclick="feedbackCapture.quickVote('missing')" style="margin: 2px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 11px;">🤔 Missing something</button>
                </div>
                
                <div style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #fbbf24;">
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px;">Scope for MVP:</div>
                    <button onclick="feedbackCapture.markScope('must')" style="margin: 2px; padding: 4px 8px; border: 1px solid #22c55e; border-radius: 4px; background: #dcfce7; cursor: pointer; font-size: 11px;">✅ Must Have</button>
                    <button onclick="feedbackCapture.markScope('nice')" style="margin: 2px; padding: 4px 8px; border: 1px solid #3b82f6; border-radius: 4px; background: #dbeafe; cursor: pointer; font-size: 11px;">👍 Nice to Have</button>
                    <button onclick="feedbackCapture.markScope('later')" style="margin: 2px; padding: 4px 8px; border: 1px solid #f59e0b; border-radius: 4px; background: #fef3c7; cursor: pointer; font-size: 11px;">⏭️ Version 2</button>
                    <button onclick="feedbackCapture.markScope('never')" style="margin: 2px; padding: 4px 8px; border: 1px solid #ef4444; border-radius: 4px; background: #fee2e2; cursor: pointer; font-size: 11px;">❌ Not Needed</button>
                </div>
                
                <div style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #fbbf24;">
                    <button onclick="feedbackCapture.startWorkflowRecording()" style="width: 100%; padding: 6px; border: 1px solid #dc2626; border-radius: 4px; background: #fef2f2; cursor: pointer; font-size: 11px; font-weight: 600;">
                        🔴 Record My Workflow
                    </button>
                </div>
                
                <div style="margin: 8px 0;">
                    <button onclick="feedbackCapture.addComment()" style="width: 100%; padding: 6px; border: 1px solid #6b7280; border-radius: 4px; background: white; cursor: pointer; font-size: 11px;">
                        💬 Add Comment
                    </button>
                </div>
                
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #fbbf24; font-size: 10px; color: #78350f;">
                    <div>🕐 Time: <span id="feedback-time">0:00</span></div>
                    <div>🖱️ Clicks: <span id="feedback-clicks">0</span></div>
                    <div>📝 Feedback: <span id="feedback-count">0</span></div>
                </div>
                
                <div style="margin-top: 8px;">
                    <button onclick="feedbackCapture.exportFeedback()" style="width: 100%; padding: 6px; border: 2px solid #059669; border-radius: 4px; background: #10b981; color: white; cursor: pointer; font-size: 12px; font-weight: bold;">
                        📤 Export Feedback
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Update timer
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('feedback-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // Track all interactions
    trackInteractions() {
        document.addEventListener('click', (e) => {
            this.interactionCount++;
            document.getElementById('feedback-clicks').textContent = this.interactionCount;
            
            // Log interaction with context
            const interaction = {
                timestamp: Date.now() - this.startTime,
                element: e.target.tagName,
                id: e.target.id,
                class: e.target.className,
                text: e.target.textContent?.substring(0, 30),
                position: { x: e.clientX, y: e.clientY }
            };
            
            this.feedback.interactions.push(interaction);
            
            // Auto-detect patterns
            this.detectInteractionPatterns();
        });
    }
    
    // Detect confusion patterns
    detectInteractionPatterns() {
        const recent = this.feedback.interactions.slice(-5);
        
        // Rapid clicking might indicate confusion
        if (recent.length === 5) {
            const timeSpan = recent[4].timestamp - recent[0].timestamp;
            if (timeSpan < 2000) {  // 5 clicks in 2 seconds
                this.showToast('😕 Seems like you might be looking for something?');
                this.feedback.painPoints.push({
                    type: 'rapid-clicking',
                    timestamp: Date.now() - this.startTime,
                    context: 'User clicked rapidly, might indicate confusion'
                });
            }
        }
    }
    
    // Pain point capture
    addPainPointCapture() {
        document.addEventListener('dblclick', (e) => {
            if (e.shiftKey) {
                const description = prompt('What\'s the issue here?');
                if (description) {
                    const painPoint = {
                        timestamp: Date.now() - this.startTime,
                        x: e.pageX,
                        y: e.pageY,
                        description,
                        element: e.target.tagName,
                        context: e.target.textContent?.substring(0, 50)
                    };
                    
                    this.feedback.painPoints.push(painPoint);
                    
                    // Add visual marker
                    const marker = document.createElement('div');
                    marker.innerHTML = '⚠️';
                    marker.title = description;
                    marker.style.cssText = `position: absolute; left: ${e.pageX}px; top: ${e.pageY}px; font-size: 20px; z-index: 9999; cursor: help;`;
                    document.body.appendChild(marker);
                    
                    this.showToast('Pain point recorded');
                    this.updateFeedbackCount();
                }
            }
        });
    }
    
    // Column-specific feedback for Master View
    addColumnFeedback(element, columnName) {
        const feedbackBtn = document.createElement('button');
        feedbackBtn.innerHTML = '💭';
        feedbackBtn.style.cssText = 'position: absolute; top: 5px; right: 40px; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 14px;';
        feedbackBtn.title = `Give feedback on ${columnName} column`;
        
        feedbackBtn.onclick = () => {
            const feedback = prompt(`Feedback for ${columnName} column:`);
            if (feedback) {
                this.feedback.featureVotes[columnName] = feedback;
                this.showToast(`Feedback recorded for ${columnName}`);
                this.updateFeedbackCount();
            }
        };
        
        const header = element.querySelector('.column-header');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(feedbackBtn);
        }
    }
    
    // Quick voting
    quickVote(sentiment) {
        this.feedback.sentiment.push({
            timestamp: Date.now() - this.startTime,
            sentiment,
            context: this.getCurrentContext()
        });
        
        this.showToast(`Feedback: ${sentiment}`);
        this.updateFeedbackCount();
    }
    
    // Scope marking
    markScope(scope) {
        const context = this.getCurrentContext();
        const feature = prompt('What feature are you evaluating?') || context;
        
        const scopeMap = {
            'must': 'mustHave',
            'nice': 'niceToHave',
            'later': 'outOfScope',
            'never': 'outOfScope'
        };
        
        this.feedback.scopeDecisions[scopeMap[scope]].push({
            feature,
            timestamp: Date.now() - this.startTime,
            context
        });
        
        this.showToast(`"${feature}" marked as ${scope}`);
        this.updateFeedbackCount();
    }
    
    // Workflow recording
    startWorkflowRecording() {
        this.currentWorkflow = {
            startTime: Date.now() - this.startTime,
            steps: [],
            description: ''
        };
        
        this.isRecording = true;
        
        // Change button to stop
        const btn = event.target;
        btn.textContent = '⏹️ Stop Recording';
        btn.onclick = () => this.stopWorkflowRecording();
        btn.style.background = '#fee2e2';
        
        this.showToast('Recording workflow...');
        
        // Track all clicks during recording
        this.recordingHandler = (e) => {
            if (this.isRecording) {
                this.currentWorkflow.steps.push({
                    timestamp: Date.now() - this.startTime,
                    element: e.target.tagName,
                    text: e.target.textContent?.substring(0, 30),
                    action: 'click'
                });
            }
        };
        
        document.addEventListener('click', this.recordingHandler);
    }
    
    stopWorkflowRecording() {
        this.isRecording = false;
        document.removeEventListener('click', this.recordingHandler);
        
        const description = prompt('What were you trying to accomplish?');
        if (description) {
            this.currentWorkflow.description = description;
            this.currentWorkflow.endTime = Date.now() - this.startTime;
            this.feedback.workflows.push(this.currentWorkflow);
            
            this.showToast('Workflow recorded!');
            this.updateFeedbackCount();
        }
        
        // Reset button
        const btn = event.target;
        btn.textContent = '🔴 Record My Workflow';
        btn.onclick = () => this.startWorkflowRecording();
        btn.style.background = '#fef2f2';
    }
    
    // Add comment
    addComment() {
        const comment = prompt('Your comment:');
        if (comment) {
            if (!this.feedback.comments) this.feedback.comments = [];
            this.feedback.comments.push({
                timestamp: Date.now() - this.startTime,
                comment,
                context: this.getCurrentContext()
            });
            
            this.showToast('Comment added');
            this.updateFeedbackCount();
        }
    }
    
    // Keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'f':
                        e.preventDefault();
                        this.addComment();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.markScope('must');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.markScope('nice');
                        break;
                    case 'x':
                        e.preventDefault();
                        this.markScope('never');
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showHelp();
                        break;
                }
            }
        });
    }
    
    // Show help
    showHelp() {
        alert(`
            🎯 Feedback Shortcuts:
            
            Alt+F: Add comment
            Alt+M: Mark as Must Have
            Alt+N: Mark as Nice to Have
            Alt+X: Mark as Not Needed
            Alt+H: Show this help
            
            Shift+DoubleClick: Mark pain point
        `);
    }
    
    // Utilities
    getCurrentContext() {
        // Get current state from the page
        const account = document.querySelector('.card.selected')?.textContent || 'No selection';
        return account.substring(0, 50);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 8px 16px; border-radius: 6px; z-index: 10001; font-size: 14px;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    updateFeedbackCount() {
        const count = (this.feedback.sentiment?.length || 0) + 
                     (this.feedback.painPoints?.length || 0) +
                     (this.feedback.workflows?.length || 0) +
                     (this.feedback.comments?.length || 0);
        
        document.getElementById('feedback-count').textContent = count;
    }
    
    // Export feedback
    exportFeedback() {
        const summary = {
            ...this.feedback,
            summary: {
                totalTime: Math.floor((Date.now() - this.startTime) / 1000),
                totalInteractions: this.interactionCount,
                painPointCount: this.feedback.painPoints.length,
                workflowsRecorded: this.feedback.workflows.length,
                sentimentBreakdown: this.analyzeSentiment()
            }
        };
        
        // Copy to clipboard
        const json = JSON.stringify(summary, null, 2);
        navigator.clipboard.writeText(json);
        
        // Also download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-${this.subModuleId}-${Date.now()}.json`;
        a.click();
        
        // Show in console
        console.log('=== STAKEHOLDER FEEDBACK EXPORT ===');
        console.log(summary);
        
        this.showToast('Feedback exported! (Check downloads)');
    }
    
    analyzeSentiment() {
        const sentiments = this.feedback.sentiment || [];
        const breakdown = {};
        sentiments.forEach(s => {
            breakdown[s.sentiment] = (breakdown[s.sentiment] || 0) + 1;
        });
        return breakdown;
    }
    
    // Track navigation flow (Master View specific)
    trackNavigationFlow() {
        const originalHandlers = {
            selectAccount: window.selectAccount,
            selectLocation: window.selectLocation,
            selectWorkOrder: window.selectWorkOrder
        };
        
        // Wrap the selection functions
        window.selectAccount = (account) => {
            this.feedback.timeTracking.accountSelection = Date.now() - this.startTime;
            originalHandlers.selectAccount(account);
        };
        
        window.selectLocation = (location) => {
            this.feedback.timeTracking.locationSelection = Date.now() - this.startTime;
            originalHandlers.selectLocation(location);
        };
        
        window.selectWorkOrder = (order) => {
            this.feedback.timeTracking.workOrderSelection = Date.now() - this.startTime;
            originalHandlers.selectWorkOrder(order);
        };
    }
}

// Auto-initialize if we're in a concept file
if (typeof window !== 'undefined' && window.location.href.includes('CONCEPT')) {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Try to auto-detect sub-module from the page
            const hierarchyBadge = document.querySelector('.hierarchy-badge');
            const subModuleId = hierarchyBadge?.textContent || '1.1.1';
            const title = document.querySelector('h1')?.textContent || 'Unknown Module';
            
            window.feedbackCapture = new SubModuleFeedbackCapture(subModuleId, title);
            window.feedbackCapture.init();
        });
    }
}