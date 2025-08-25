/**
 * STAKEHOLDER FEEDBACK CAPTURE SYSTEM
 * Embed this directly into concept implementations!
 */

// 1. INLINE FEEDBACK BUTTONS
function addFeedbackButton(element, context) {
    const btn = document.createElement('button');
    btn.innerHTML = '💭';
    btn.style.cssText = 'position:absolute;top:5px;right:5px;opacity:0.3;cursor:pointer';
    btn.title = 'Give feedback on this feature';
    
    btn.onclick = () => {
        const feedback = prompt(`Feedback for ${context}:`);
        if (feedback) {
            captureFeedback(context, feedback);
        }
    };
    
    element.style.position = 'relative';
    element.appendChild(btn);
}

// 2. FEATURE VOTING SYSTEM
const featureVotes = {
    mustHave: [],
    niceToHave: [],
    notNeeded: [],
    confused: []
};

function addFeatureVoting(featureId, description) {
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div style="position:fixed;bottom:60px;right:20px;background:white;border:2px solid #ddd;padding:10px;border-radius:8px;z-index:9999">
            <div style="font-size:12px;margin-bottom:8px">${description}</div>
            <button onclick="voteFeature('${featureId}', 'mustHave')">🎯 Must Have</button>
            <button onclick="voteFeature('${featureId}', 'niceToHave')">👍 Nice to Have</button>
            <button onclick="voteFeature('${featureId}', 'notNeeded')">🚫 Not Needed</button>
            <button onclick="voteFeature('${featureId}', 'confused')">😕 Confused</button>
        </div>
    `;
    document.body.appendChild(panel);
}

// 3. WORKFLOW RECORDING
let workflowRecording = [];
let isRecording = false;

function startWorkflowRecording() {
    workflowRecording = [];
    isRecording = true;
    
    // Capture all clicks
    document.addEventListener('click', recordClick);
    
    // Show recording indicator
    const indicator = document.createElement('div');
    indicator.id = 'recording-indicator';
    indicator.innerHTML = '🔴 Recording Workflow...';
    indicator.style.cssText = 'position:fixed;top:20px;right:20px;background:red;color:white;padding:10px;border-radius:5px;z-index:9999';
    document.body.appendChild(indicator);
}

function recordClick(e) {
    if (!isRecording) return;
    
    workflowRecording.push({
        timestamp: Date.now(),
        element: e.target.className,
        text: e.target.textContent?.substring(0, 50),
        position: { x: e.clientX, y: e.clientY }
    });
}

function stopWorkflowRecording() {
    isRecording = false;
    document.removeEventListener('click', recordClick);
    document.getElementById('recording-indicator')?.remove();
    
    // Show workflow summary
    console.log('Recorded Workflow:', workflowRecording);
    
    // Ask for feedback
    const feedback = prompt('Describe what you were trying to accomplish:');
    saveWorkflow(workflowRecording, feedback);
}

// 4. PAIN POINT MARKERS
function addPainPointMarker() {
    document.addEventListener('dblclick', (e) => {
        if (e.shiftKey) {
            const marker = document.createElement('div');
            marker.innerHTML = '⚠️';
            marker.style.cssText = `position:absolute;left:${e.pageX}px;top:${e.pageY}px;font-size:24px;z-index:9999`;
            marker.title = prompt('What\'s wrong here?') || 'Pain point';
            document.body.appendChild(marker);
            
            savePainPoint({
                x: e.pageX,
                y: e.pageY,
                description: marker.title,
                url: window.location.href
            });
        }
    });
}

// 5. SCOPE BOUNDARY TRACKER
const scopeDecisions = {
    inScope: [],
    outOfScope: [],
    maybeScope: []
};

function addScopeDecisionTool() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            const selected = window.getSelection().toString();
            if (!selected) return;
            
            if (e.key === 'i') {
                scopeDecisions.inScope.push(selected);
                showToast('✅ Added to MVP scope');
            } else if (e.key === 'o') {
                scopeDecisions.outOfScope.push(selected);
                showToast('❌ Excluded from MVP');
            } else if (e.key === 'm') {
                scopeDecisions.maybeScope.push(selected);
                showToast('🤔 Maybe for MVP');
            }
            
            saveScopeDecisions();
        }
    });
}

// 6. TIME TRACKING
let timeSpent = {};
let currentTimer = null;

function trackTimeOnFeature(featureId) {
    if (currentTimer) {
        clearInterval(currentTimer.interval);
        timeSpent[currentTimer.feature] = (timeSpent[currentTimer.feature] || 0) + 
            (Date.now() - currentTimer.start);
    }
    
    currentTimer = {
        feature: featureId,
        start: Date.now(),
        interval: setInterval(() => {
            const elapsed = Math.floor((Date.now() - currentTimer.start) / 1000);
            console.log(`Time on ${featureId}: ${elapsed}s`);
        }, 5000)
    };
}

// 7. A/B TESTING IN CONCEPT
function showABVariant() {
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    
    if (variant === 'A') {
        // Three column layout
        document.getElementById('master-view').style.display = 'flex';
    } else {
        // Tabbed layout
        document.getElementById('master-view').style.display = 'block';
        addTabs();
    }
    
    // Track which variant
    setTimeout(() => {
        const preference = confirm(`Do you prefer this layout? (Variant ${variant})`);
        saveABTestResult(variant, preference);
    }, 30000); // Ask after 30 seconds
}

// 8. SAVE ALL FEEDBACK
function saveAllFeedback() {
    const feedback = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        featureVotes,
        scopeDecisions,
        timeSpent,
        workflowRecordings: workflowRecording,
        userAgent: navigator.userAgent
    };
    
    // In concept, just console.log
    // In prototype, might POST to an endpoint
    console.log('=== STAKEHOLDER FEEDBACK ===');
    console.log(feedback);
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(feedback, null, 2));
    alert('Feedback copied to clipboard!');
}

// 9. HELP OVERLAY
function addHelpOverlay() {
    const help = document.createElement('div');
    help.innerHTML = `
        <div style="position:fixed;top:10px;left:10px;background:yellow;padding:10px;border-radius:5px;font-size:11px;max-width:200px;z-index:9999">
            <b>Stakeholder Testing Mode</b><br>
            • Double-click: Set search filter<br>
            • Shift+DblClick: Mark pain point<br>
            • Alt+I: Mark as "In Scope"<br>
            • Alt+O: Mark as "Out of Scope"<br>
            • Alt+M: Mark as "Maybe"<br>
            • Click 💭: Leave feedback<br>
            • Press F1: Show/hide this help
        </div>
    `;
    help.id = 'help-overlay';
    document.body.appendChild(help);
}

// 10. SENTIMENT TRACKER
function addSentimentTracker() {
    const moods = ['😍', '😊', '😐', '😕', '😤'];
    const tracker = document.createElement('div');
    tracker.innerHTML = `
        <div style="position:fixed;top:60px;right:20px;background:white;padding:10px;border-radius:5px;border:1px solid #ddd">
            <div style="font-size:12px;margin-bottom:5px">How are you feeling?</div>
            ${moods.map(m => `<button onclick="trackSentiment('${m}')" style="font-size:20px;border:none;background:none;cursor:pointer">${m}</button>`).join('')}
        </div>
    `;
    document.body.appendChild(tracker);
}

// Utility functions
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:black;color:white;padding:10px 20px;border-radius:5px;z-index:9999';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Auto-initialize on concept pages
if (window.location.href.includes('CONCEPT')) {
    document.addEventListener('DOMContentLoaded', () => {
        addHelpOverlay();
        addPainPointMarker();
        addScopeDecisionTool();
        addSentimentTracker();
        
        console.log('📊 Stakeholder feedback capture ACTIVATED!');
    });
}